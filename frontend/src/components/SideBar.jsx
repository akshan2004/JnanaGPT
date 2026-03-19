import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import assets from "../assets/assets";
import moment from "moment";
import toast from "react-hot-toast";

const SideBar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    chats, // ✅ FIXED
    setSelectedChat,
    theme,
    user,
    navigate,
    createnewChat,
    axios,
    setChats,
    fetchUsersChats,
    setToken,
    token // ✅ FIXED
  } = useAppContext();

  const [search, setSearch] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.success("Logged Out Successfully..!");
  };

  const deleteChat = async (e, chatId) => {
    try {
      e.stopPropagation();
      const confirm = window.confirm("Are you sure want to delete this Chat?");
      if (!confirm) return;

      const { data } = await axios.post(
        "/api/chat/delete",
        { chatId },
        { headers: { Authorization: token } }
      );

      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId)); // ✅ FIXED
        await fetchUsersChats();
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message); // ✅ FIXED
    }
  };

  return (
    <div
      className={`flex flex-col h-screen min-w-72 p-5 dark:bg-gradient-to-b from-[#242124]/30 to-[#000000]/30 border-r border-[#80609F]/30 backdrop-blur-3xl transition-colors duration-500 max-md:absolute left-0 z-10 ${
        !isMenuOpen && "max-md:-translate-x-full"
      }`}
    >
      <img
        src={theme === "dark" ? assets.logo_full_dark : assets.logo_full}
        alt="JnanaGPT"
        className="w-full max-w-60 -mt-4 object-contain"
      />

      {/* New Chat Button */}
      <button
        onClick={createnewChat}
        className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-[#A456F7] to-[#3D81F6] text-sm rounded-md cursor-pointer"
      >
        <span className="mr-2 text-xl">+</span> New Chat
      </button>

      {/* Search */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img src={assets.search_icon} className="w-4 invert dark:invert-0" alt="" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search Conversations"
          className="text-xs placeholder:text-gray-400 outline-none bg-transparent"
        />
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && <p className="mt-4 text-sm">Recent Chats</p>}

      <div className="flex-1 overflow-y-auto mt-3 text-sm space-y-3">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                  .toLowerCase()
                  .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((chat) => (
            <div
              key={chat._id}
              onClick={() => {
                navigate("/");
                setSelectedChat(chat);
                setIsMenuOpen(false);
              }}
              className="p-2 px-4 dark:bg-[#57317C]/10 border border-gray-300 dark:border-[#80609F]/15 rounded-md cursor-pointer flex justify-between group"
            >
              <div>
                <p className="truncate w-full">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>

                <p className="text-xs text-gray-500 dark:text-[#B1A6C0]">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>

              <img
                onClick={(e) =>
                  toast.promise(deleteChat(e, chat._id), {
                    loading: "deleting..."
                  })
                } // ✅ FIXED
                src={assets.bin_icon}
                className="hidden group-hover:block w-4 cursor-pointer invert dark:invert-0"
                alt=""
              />
            </div>
          ))}
      </div>

      {/* Community Images */}
      <div
        onClick={() => {
          navigate("/community");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-105 transition-all"
      >
        <img src={assets.gallery_icon} className="w-4 invert dark:invert-0" alt="" />
        <div className="flex flex-col text-sm">
          <p>Community Images</p>
        </div>
      </div>

      {/* User Account */}
      <div className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group">
        <img src={assets.user_icon} className="w-7 rounded-full" alt="" />
        <p className="flex text-sm truncate">
          {user ? user.name : "Login your Account"}
        </p>

        {user && (
          <img
            onClick={logout}
            src={assets.logout_icon}
            className="h-5 cursor-pointer hidden invert dark:invert-0 group-hover:block"
            alt=""
          />
        )}
      </div>

      <img
        onClick={() => setIsMenuOpen(false)}
        src={assets.close_icon}
        className="absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden invert dark:invert-0"
        alt=""
      />
    </div>
  );
};

export default SideBar;