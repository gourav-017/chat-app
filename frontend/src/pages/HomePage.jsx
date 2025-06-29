import React, { useContext} from 'react'
 import Sidebar from '../components/Sidebar'
import Chatcontainer from '../components/Chatcontainer';
import Rightsidebar from '../components/Rightsidebar';
import { ChatContext } from '../../context/ChatContext';

const HomePage = () => {
const { selectedUser } = useContext(ChatContext);
  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[5%] ' >
     <div className={`backdrop-blur-xl  border border-gray-800 rounded-xl overflow-hidden h-[100%]
      grid grid-cols-1 relative ${selectedUser?'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]':'md:grid-cols-2'}`}>
     <Sidebar/>
      <Chatcontainer />
      <Rightsidebar />
     </div>
    </div>
  )
}

export default HomePage
