import React, { useEffect } from "react";
import assets  from "../assets/assets";
import { useContext  ,useState} from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const Rightsidebar = () => {
  const {selectedUser,messages} = useContext(ChatContext);
  const{logout,onlineUsers}=useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);

  // get all images from messages and set them to msgImages
  useEffect(() => {
    setMsgImages(messages.filter(msg => msg.image).map(msg => msg.image));

  },[messages]);
  return selectedUser && (
      <div
        className={`bg-[#8185b2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""
          }`}
      >

        <div className="pt-5 flex flex-col justify-center items-center gap-2 text-xs font-light mx-auto">
          <img
            className="w-20 aspect-[1/1] rounded-full"
            src={selectedUser?.profilePic || assets.avatar_icon}
            alt=""
          />
          <div className="text-xl font-medium flex items-center gap-2">
           {onlineUsers.includes(selectedUser._id)&& <p className="w-2 h-2 rounded-full bg-green-500"></p>}
            <h1>{selectedUser.fullName}</h1>
          </div>
          <p className="text-center">{selectedUser.bio}</p>
        </div>

        <hr className="border-[#ffffff50] my-4"  />
            <div className="px-5 text-xs">
              <p>Media</p>
              <div className="mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80"> 
                  {msgImages.map((url,index)=>(
                    <div key={index} onClick={()=>window.open(url)} className="cursor-pointer rounded">
                      <img src={url} alt=""  className="h-full rounded-md"/>
                    </div>
                  ))}
              </div>
            </div>

            <button onClick={()=>logout()}className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm  font-light py-2 px-20 rounded-full cursor-pointer">Logout</button>
      </div>
    );

};

export default Rightsidebar;
