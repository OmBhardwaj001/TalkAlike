"use client"
import {createContext,useState,useEffect,useContext} from 'react'
import { Socket } from "socket.io-client"
import { chat_service, useAppData } from './AppContext';
import { io } from 'socket.io-client';

interface SocketContextType{
    socket: Socket | null;
    onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers:[],
});

interface ProviderProps{
    children : React.ReactNode
}

export const SocketProvider = ({children} : ProviderProps)=>{
    const [socket,setSocket] = useState<Socket | null>(null);
    const [onlineUsers ,setOnlineUsers] = useState<string[]>([])
    

    
    const {user} = useAppData();    
    
    useEffect(()=>{
        if(!user?._id) return

        const newSocket = io(chat_service,{
            query:{
                userId: user._id
            }
        })

        setSocket(newSocket);

        newSocket.on("getOnlineUser",(users : string[])=>{
            setOnlineUsers(users)
        })

        return ()=>{
            newSocket.disconnect();
        };
    },[user?._id]);

    return <SocketContext.Provider value={{socket, onlineUsers}}>
        {children}
    </SocketContext.Provider>
}


export const SocketData = () => useContext(SocketContext); 
