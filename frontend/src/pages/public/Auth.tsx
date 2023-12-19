import { Button, TextInput } from "@mantine/core";
import axios from "axios";
import React, { useState } from "react";

function Auth() {
    const [code, setCode] = useState<number>();
    const [invalidCode, setInvalidCode] = useState<boolean>(false);
    const [send, setSend] = useState<boolean>(true);

    const handleDisableSendCode = async () => {
        console.log("this is the code was send: ",code);
        await axios.post("http://localhost:3001/2fa/auth", {AuthCode: code})
        .then((res) => {
            if(res.status == 201)
            {
                window.location.href = "http://localhost:3000/";
            } else {
                setInvalidCode(true);
            }
        })
        .catch((err) => {
            setInvalidCode(true);
            console.error("Error in sending 2f code In Auth section: ", err);
        })
      };

    const handleSaveCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        setInvalidCode(false);
        if (!isNaN(Number(e.target.value)) && e.target.value.length <= 6) {
            e.target.value.length === 6 ? (setCode(Number(e.target.value)), setSend(false)) : setSend(true)
        } else {
            setInvalidCode(true);
        }
    };

    return (
        <div>
            <TextInput
                onChange={handleSaveCode}
                label="Entre Code of Virification"
                error={invalidCode ? "set a valid code" : false}
            />
            <Button onClick={handleDisableSendCode} disabled={send}>Send</Button>
            {/* <Button onClick={handleCancel} >Cancel</Button> */}
        </div>
    );
}

export  default Auth