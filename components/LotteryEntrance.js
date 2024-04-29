import { contractAddresses, abi, AADHAR_SERVER_URL, field_to_numbers } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState, useRef, useCallback } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"
import Webcam from 'react-webcam'
import crypto, {generateKeyPairSync, publicEncrypt} from 'crypto'; 
import Image from "next/image"
import axios from 'axios';
import EncryptRsa from 'encrypt-rsa'; 

const videoConstraints = {
    facingMode: 'user'
}

export default function LotteryEntrance() {
    const { account, Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables
    const [otpsent, setOtpSent] = useState(false); 
    const [aadharIDOtpSection, setAadharOtpSection] = useState(""); 
    const [isValidIDOtp, setIsValidOtp] = useState(true); 

    const [rsaPublicKey, setRsaPublicKey] = useState(""); 
    const [rsaPrivateKey, setRsaPrivateKey] = useState(""); 

    const [tempRsaKey, setTempRsaKey] = useState(""); 
    const [name, setName] = useState("");
    const [fatherName, setFatherName] = useState(""); 
    const [motherName, setMotherName] = useState(""); 
    const [dob, setDob] = useState(""); 
    const [address, setAddress] = useState("") ;
    const [phoneNumber, setPhoneNumber] = useState(); 
    const [rdm, setRDM] = useState("");

    const [image, setImage] = useState('')
    const webcamRef = useRef(null)
    const capture = useCallback(() => {
      const imageSrc = webcamRef.current.getScreenshot()
      setImage(imageSrc)
      console.log(imageSrc); 
    }, [webcamRef])


    const [aadharIDAuthSection, setAadharIDAuthSection] = useState(""); 
    const [otpSent1, setOtpSent1] = useState(false);
    const [isValidIDOtp1, setIsValidOtp1] = useState(true);

    const [field, setField] = useState(''); 
    const [fieldNumber, setFieldNumber] = useState(1);

    // const {
    //     runContractFunction: enterRaffle,
    //     data: enterTxResponse,
    //     isLoading,
    //     isFetching,
    // } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: raffleAddress,
    //     functionName: "enterRaffle",
    //     msgValue: entranceFee,
    //     params: {},
    // })

    // /* View Functions */

    // const { runContractFunction: getEntranceFee } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: raffleAddress, // specify the networkId
    //     functionName: "getEntranceFee",
    //     params: {},
    // })

    // const { runContractFunction: getPlayersNumber } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: raffleAddress,
    //     functionName: "getNumberOfPlayers",
    //     params: {},
    // })

    // const { runContractFunction: getRecentWinner } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: raffleAddress,
    //     functionName: "getRecentWinner",
    //     params: {},
    // })

    // async function updateUIValues() {
    //     // Another way we could make a contract call:
    //     // const options = { abi, contractAddress: raffleAddress }
    //     // const fee = await Moralis.executeFunction({
    //     //     functionName: "getEntranceFee",
    //     //     ...options,
    //     // })
    //     const entranceFeeFromCall = (await getEntranceFee()).toString()
    //     const numPlayersFromCall = (await getPlayersNumber()).toString()
    //     const recentWinnerFromCall = await getRecentWinner()
    //     setEntranceFee(entranceFeeFromCall)
    //     setNumberOfPlayers(numPlayersFromCall)
    //     setRecentWinner(recentWinnerFromCall)
    // }

    useEffect(() => {
        if (isWeb3Enabled) {
            // updateUIValues()
        }
    }, [isWeb3Enabled])
    // no list means it'll update everytime anything changes or happens
    // empty list means it'll run once after the initial rendering
    // and dependencies mean it'll run whenever those things in the list change

    // An example filter for listening for events, we will learn more on this next Front end lesson
    // const filter = {
    //     address: raffleAddress,
    //     topics: [
    //         // the name of the event, parnetheses containing the data type of each event, no spaces
    //         utils.id("addUser(address)"),
    //     ],
    // }

    // const handleNewNotification = () => {
    //     dispatch({
    //         type: "info",
    //         message: "Transaction Complete!",
    //         title: "Transaction Notification",
    //         position: "topR",
    //         icon: "bell",
    //     })
    // }

    // const handleSuccess = async (tx) => {
    //     try {
    //         await tx.wait(1)
    //         updateUIValues()
    //         handleNewNotification(tx)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    const handleSendOtp = async (e) => {
        e.preventDefault();
        const res = await axios.post(`${AADHAR_SERVER_URL}/api/sendotp`, {
            aadharNumber: aadharIDOtpSection
        }); 
        if(res.status == 400){
            setIsValidOtp(false); 
            return; 
        }
        setOtpSent(true); 
    }

    const submitInfo = async (e) => {
        e.preventDefault(); 
        // console.log(account); 
        const response = await axios.post(`${AADHAR_SERVER_URL}/api/postdata` , {
            aadharNumber: aadharIDOtpSection,
            data: {
                phoneNumber: phoneNumber,
                name: name, 
                fatherName: fatherName, 
                motherName: motherName, 
                dateOfBirth: dob,
                address: address,
                biometrics: image
            }, 
            secpKey: account
        })
        localStorage.setItem('RDMseed', response.data.seed);
    }

    const handleDropdownChange = (e) => {
        console.log(e.target.value);
        // console.log(fieldNumber);  
        setFieldNumber(field_to_numbers[e.target.value]);
        // setField(e.target.value);
    }

    return (
        <div className="p-5">
            {raffleAddress ? (
                <div>
                    <h1>Request OTP</h1>
                    <div>
                    {/* Enter aadhar number section */}
                    <input placeholder="Enter your Aadhar Number" type="text" onChange={(e) => {setAadharOtpSection(e.target.value)}} />
                    {!isValidIDOtp ? (<div>Enter a valid ID</div>) : (<></>) }
                    <div>
                        <button onClick={async (e) => {await handleSendOtp(e)}} className="bg-red-500" disabled={aadharIDOtpSection==""}>Send OTP</button>
                    </div>
                    {otpsent ? (<div>OTP sent</div>) : (<></>)}
                    </div>  
                    <div>-----------------------------------------------------------------------------------</div>
                    {/* -------------------------------------------------- */}
                    <div>
                    {/* Post info about user */}
                        <div>-----------------------------------------------------------------------------------</div>
                        <div>
                            <h1>Enter Info</h1>
                            <div><input type="text" placeholder="Enter temporary RSA Key" onChange={(e) => setTempRsaKey(e.target.value)} /></div>
                            <div><input type="text" placeholder="Name" onChange={(e) => {setName(e.target.value)}} /></div>
                            <div><input type="text" placeholder="Father's Name" onChange={(e) => {setFatherName(e.target.value)}}/></div>
                            <div><input type="text" placeholder="Mother's Name" onChange={(e) => {setMotherName(e.target.value)}} /></div>
                            <div><input type="text" placeholder="DOB in DDMMYYY format" onChange={(e) => {setDob(e.target.value)}} /></div> 
                            <div><input type="text" placeholder="address" onChange={(e) => setAddress(e.target.value)} /></div>
                            <div><input type="text" placeholder="Phone Number" onChange={(e) => setPhoneNumber(BigInt(e.target.value))} /></div>
                            <div>
                                <Webcam className='camera-feed' audio={false} ref={webcamRef} screenshotFormat='image/jpeg' videoConstraints={videoConstraints}/>
                                {image==""? (<></>):(<Image src={image} alt='image' width={"100%"} height={"100%"} />)}
                                <div>
                                    <button onClick={capture} className="bg-red-500">Capture</button>
                                </div>
                            </div>
                            <button className="bg-red-500" onClick={async (e) => {await submitInfo(e)}}
                                disabled={tempRsaKey=="" || name=="" || fatherName=="" || motherName=="" || dob=="" || address=="" || phoneNumber=="" || image==""}
                            >Submit Info</button>
                        </div>
                    </div>
                    <div>-----------------------------------------------------------------------------------</div>
                    {/* Authentication */}
                    <div>
                        <h1>Authenticate</h1>
                        <div>
                            <input placeholder="Enter your Aadhar Number" type="text" onChange={(e) => {setAadharIDAuthSection(e.target.value)}} />
                            {!isValidIDOtp1 ? (<div>Enter a valid ID</div>) : (<></>) }
                            <div>
                                <button onClick={async (e) => {await handleSendOtp(e)}} className="bg-red-500" disabled={aadharIDOtpSection==""}>Send OTP</button>
                            </div>
                            {otpsent ? (<div>OTP sent</div>) : (<></>)}
                        </div>
                        <div>
                            <input placeholder="Enter session RSA key" />
                        </div>
                        <div>
                            <div>Enter field to check</div>
                            <select onChange={(e) => handleDropdownChange(e)} >
                                <option value="name">name</option>    
                                <option value="dob">date of Birth</option>    
                                <option value="fatherName">father Name</option>    
                                <option value="motherName">Mother Name</option>    
                                <option value="address">address</option>    
                                <option value="biometrics">biometrics</option>    
                                <option value="phoneNumber">phoneNumber</option>    
                            </select>       
                            <div>
                                <button className="bg-red-500" >Authenticate</button>                     
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
