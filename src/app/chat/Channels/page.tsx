'use client'

import ChannelsMain from "../../components/Channels/ChannelsMain"
import { ChatLeftBar } from "../../components/ChatLeftBar/ChatLeftBar"
import { SessionUserProvider } from "../../context/SessionUserContext"
import style from '../page.module.css';



export default function Channels() {
  
  
  return (
    <SessionUserProvider>
      <div className={style.initial_arranging}>
        <ChatLeftBar activateShrinkMode={true}/>
        <ChannelsMain/>
      </div>
    </SessionUserProvider>
    // <ConfirmationDialog selectType={"Ban"}/>
    )
}
