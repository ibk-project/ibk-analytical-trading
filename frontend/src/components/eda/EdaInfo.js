import React, {useState, useEffect} from "react";
import "../css/EdaInfo.css"

function EdaInfo(props) {
    const sidebarClass = props.isOpen ? "eda-info open" : "eda-info";
    const [edaType, setEdaType] = useState("none"); // none, market, sector, stock
    const [edaName, setEdaName] = useState("none"); // none, (name)
    const [edaCode, setEdaCode] = useState("none"); // none, (code)
    const [edaFlag, setEdaFlag] = useState(false);

    useEffect(() => {
        if (props.edaType === "none") {
            setEdaFlag(false);
            setEdaType("none");
            setEdaName("none");
            setEdaCode("none");
        }
        else {
            setEdaFlag(true);
            setEdaType(props.edaType);
            setEdaName(props.edaName);
            setEdaCode(props.edaCode);
        }
    });

    return (
        <div class={sidebarClass}>
            <div id="eda-info-container">
                {edaFlag ?
                <>
                <div>
                    code is {edaCode}
                </div>
                <div>
                    name is {edaName}
                </div>
                <div>
                    type is {edaType}
                </div>
                </>
                :
                null}
            </div>
        </div>
    )
}

export default EdaInfo;