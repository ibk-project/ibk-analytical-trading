import pandas as pd
import numpy as np
import torch 
import torch.nn as nn

import matplotlib.pyplot as plt
import math
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta

import itertools

from functools import reduce
from tqdm.notebook import tqdm
from sklearn.preprocessing import StandardScaler, RobustScaler, MinMaxScaler, MaxAbsScaler
from sklearn.metrics import roc_curve, roc_auc_score

torch.manual_seed(42)
np.random.seed(42)

# model class
class CustomDataset(torch.utils.data.Dataset): 
    def __init__(self, X, y):
        self.X = X
        self.y = y

    def __len__(self):
        return len(self.X)
    
    def __getitem__(self, idx): 
        return self.X[idx], self.y[idx]

class SimilarPointModel():
    def __init__(self):
        self.DEVICE = torch.device("cpu")
        self.model1 = self.DimensionReductionModel(self.DEVICE)
        self.model2 = self.MarketPredictionModel(self.DEVICE)

    class DimensionReductionModel():
        def __init__(self, DEVICE):
            self.EPOCH = 400
            self.BATCH_SIZE = 128
            self.DEVICE = DEVICE
            class Autoencoder(nn.Module):
                def __init__(self):
                    super(Autoencoder, self).__init__()

                    self.encoder = nn.Sequential(
                        nn.Linear(149, 128),
                        nn.ReLU(),
                        nn.Linear(128, 96),
                        nn.ReLU(),
                        nn.Linear(96, 64),
                    )
                    self.decoder = nn.Sequential(
                        nn.Linear(64, 96),
                        nn.ReLU(),
                        nn.Linear(96, 128),
                        nn.ReLU(),
                        nn.Linear(128, 149)
                    )

                def forward(self, x):
                    encoded = self.encoder(x)
                    decoded = self.decoder(encoded)
                    return encoded, decoded
            self.model = Autoencoder().to(self.DEVICE)

        def train(self, feature):
            def _train(autoencoder, train_loader):
                autoencoder.train()
                running_loss = 0
                for step, data in enumerate(train_loader):
                    x = data[0].to(self.DEVICE)
                    y = data[1].to(self.DEVICE)

                    encoded, decoded = autoencoder(x)

                    loss = criterion(decoded, y)
                    optimizer.zero_grad()
                    loss.backward()
                    optimizer.step()

                    running_loss += loss.item()
                running_loss /=self.BATCH_SIZE
                return running_loss

            optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
            criterion = nn.MSELoss() 
            X = torch.tensor(feature.to_numpy(), dtype=torch.float32)
            trainset = CustomDataset(X, X)
            train_loader = torch.utils.data.DataLoader(
                dataset     = trainset,
                batch_size  = self.BATCH_SIZE,
                shuffle     = True,
                num_workers = 0
            )
            losses = []
            for epoch in tqdm(range(1, self.EPOCH+1), leave=False, desc='autoencoder'):
                loss = _train(self.model, train_loader)
                losses.append(loss)
                if epoch % 100 == 0: print(f"epoch: {epoch} loss: {loss}")
            plt.plot(losses)
            plt.show()

    class MarketPredictionModel():
        def __init__(self, DEVICE):
            self.EPOCH = 1000
            self.BATCH_SIZE = 128
            self.DEVICE = DEVICE

            class EncoderDecoder(nn.Module):
                def __init__(self):
                    super(EncoderDecoder, self).__init__()

                    self.encoder = nn.Sequential(
                        nn.Linear(64, 48),
                        nn.ReLU(),
                        nn.Linear(48, 32),
                        nn.ReLU(),
                        nn.Linear(32, 24),
                    )
                    self.decoder = nn.Sequential(
                        nn.Linear(24, 24),
                        nn.ReLU(),
                        nn.Linear(24, 16),
                    )

                def forward(self, x):
                    encoded = self.encoder(x)
                    decoded = self.decoder(encoded)
                    return encoded, decoded
            self.model = EncoderDecoder().to(self.DEVICE)
        
        def train(self, encoded_data1, label):
            def _train(autoencoder, train_loader):
                autoencoder.train()
                running_loss = 0
                for step, data in enumerate(train_loader):
                    x = data[0].to(self.DEVICE)
                    y = data[1].to(self.DEVICE)

                    encoded, decoded = autoencoder(x)

                    loss = criterion(decoded, y)
                    optimizer.zero_grad()
                    loss.backward()
                    optimizer.step()

                    running_loss += loss.item()
                running_loss /= self.BATCH_SIZE
                return running_loss

            optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
            criterion = nn.MSELoss()
            X = torch.tensor(encoded_data1, dtype=torch.float32)
            y = torch.tensor(label.to_numpy(), dtype=torch.float32)
            trainset = CustomDataset(X, y)
            train_loader = torch.utils.data.DataLoader(
                dataset     = trainset,
                batch_size  = self.BATCH_SIZE,
                shuffle     = True,
                num_workers = 0
            )
            losses = []
            for epoch in tqdm(range(1, self.EPOCH+1), leave=False, desc='encoder-decoder'):
                loss = _train(self.model, train_loader)
                losses.append(loss)
                if epoch % 100 == 0: print(f"epoch: {epoch} loss: {loss}")
            plt.plot(losses)
            plt.show()

    def train(self, feature, label):
        with tqdm(total=2, leave=False, desc='train') as tq:
            self.model1.train(feature)
            X = torch.tensor(feature.to_numpy(), dtype=torch.float32)
            test_x = X.to(self.DEVICE)
            encoded_data1, decoded_data1 = self.model1.model(test_x)
            encoded_data1 = encoded_data1.cpu().detach().numpy()
            tq.update(1)
            self.model2.train(encoded_data1, label)
            X = torch.tensor(encoded_data1, dtype=torch.float32)
            tq.update(1)
            tq.close()

    def run(self, feature):
        X = torch.tensor(feature.to_numpy(), dtype=torch.float32)
        test_x = X.to(self.DEVICE)
        encoded_data1, decoded_data1 = self.model1.model(test_x)
        encoded_data1 = encoded_data1.cpu().detach().numpy()
        X = torch.tensor(encoded_data1, dtype=torch.float32)
        test_x = X.to(self.DEVICE)
        encoded_data2, decoded_data2 = self.model2.model(test_x)
        encoded_data2 = encoded_data2.cpu().detach().numpy()
        decoded_data2 = decoded_data2.cpu().detach().numpy()
        return encoded_data2, decoded_data2