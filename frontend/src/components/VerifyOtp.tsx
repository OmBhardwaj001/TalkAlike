"use client";
import {Lock,Loader2,ArrowBigRight} from 'lucide-react';
import {useSearchParams,useRouter} from 'next/navigation'
import react,{useState,useRef,useEffect} from 'react'
import { clearInterval, setInterval } from 'timers';
import axios from 'axios'
import Cookies from 'js-cookie';


const VerifyOtp = () => {

  const [loading , setLoading ] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(["","","","","",""]);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();


  const searchParams = useSearchParams();
  const email : string  = searchParams.get("email") || "";

  useEffect(()=>{
    if(timer > 0){
      const interval = setInterval(()=>{
        setTimer((prev)=> prev-1);
      },1000);
      return()=> clearInterval(interval);
    }
  },[timer]);

  const handleInputChange = (index: number , value:string) : void =>{
    if(value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("")
    console.log("otp",otp)
    console.log("new opt ", newOtp);

    if(value && index < 5){
      inputRefs.current[index+1]?.focus();
    }
  }

  const handleKeyDown=(index:number,e:React.KeyboardEvent<HTMLElement>):void=>{
     if(e.key === "Backspace" && !otp[index] && index>0){
      inputRefs.current[index-1]?.focus();
     }
  } 

  const handlePaste = (e:React.ClipboardEvent<HTMLInputElement>):void =>{
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g,"").slice(0,6);
    if(digits.length === 6){
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  }

  const handleSubmit= async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const otpString = otp.join("");
    if(otpString.length !== 6){
      setError("please enter all 6 digits");
      return;
    }

    setError('');
    setLoading(true);

    try {
      const {data} = await axios.post(`http://localhost:5000/api/v1/verify`,{
        email,
        otp:otpString,
      });

      alert(data.message)
      Cookies.set("token",data.token,{
        expires:15,
        secure:false,
        path:'/',
      });

      setOtp(["","","","","",""]);
      inputRefs.current[0]?.focus();
    } catch (error : any) {
      setError(error.response.data.message)
    }
    finally{
      setLoading(false);
    }
  }

  const handleResnedOtp= async()=>{
    setResendLoading(true);
    setError("");
    try {
      const {data} = await axios.post(`http://localhost:5000/api/v1/login`,{
        email,
      });

      alert(data.message);
      setTimer(60);
      
    } catch (error : any) {
      setError(error.response.data.message)
    }
    finally{
      setResendLoading(false);
    }
  }

  return(
    <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
    <div className='max-w-md w-full'>
      <div className='bg-gray-800 border border-gray-700 rounded-lg p-8'>
        <div className='text-center mb-8'>
          <div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6'>
            <Lock size={40} className='text-white'/>
          </div>
          <h1 className='text-4xl font-bold text-white mb-3'>
            Verify your Email
          </h1>
          <p className='text-gray-300 text-lg'>we have sent a 6-digit code to </p>
          <p className='text-blue-400 font-medium'>{email}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-4 text-center'>Enter your 6-digit otp here</label>
            <div className="flex justify-center items-center space-x-3">
              {
                otp.map((digit,index)=>(
                  <input
                  key={index}
                  ref={(el: HTMLInputElement | null) => {inputRefs.current[index] = el}}
                  type='text'
                  maxLength={1}
                  value={digit}
                  onChange={e => handleInputChange(index, e.target.value)}
                  onKeyDown={e=> handleKeyDown(index,e)}
                  onPaste={index === 0? handlePaste : undefined}
                  className='w-12 h-12 text-center text-xl font-bold border-2 border-gray-600  rounded-lg bg-gray-700 text-white'
                  />
                ))
              }
            </div>
          </div>
          {
            error && <div className='bg-red-900 border border-red-700 rounded-lg p-3'> 
            <p className='text-red-300 text-sm text-center'> {error} </p>
            </div>
          }
          <button 
          type='submit' disabled={loading} className='w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700  disabled:opacity-50 disabled:cursor-not-allowed'>
            {
              loading ? (<div className='flex item-center justify-center gap-2'>
                <Loader2 className='w-5 h-5'/>
                Verifying ...

              </div>) : (
                <div className='flex item-center justify-center gap-2'>
              <span>Verify</span>
              <ArrowBigRight className='w-5 h-6'/>
                </div>
              )
            } 
          </button>   
        </form>

        <div className='mt-6 text-center'>
          <p className='text-gray-400 text-sm mb-4'>
            Didn't recieve the code?
          </p>
          {
            timer>0 ? (<p className='text-gray-400 text-sm mb-4 '>Resend code in {timer} </p>) : (<button  className='text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50' disabled={resendLoading} onClick={handleResnedOtp}>{resendLoading ? "Sending..." : "Resend code"}</button>) 
          }

        </div>
      </div>
    </div>
  </div>
    
  )
}

export default VerifyOtp