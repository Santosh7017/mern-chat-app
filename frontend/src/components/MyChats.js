import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import JSEncrypt from 'jsencrypt';


let decryptor = new JSEncrypt();
decryptor.setPrivateKey('-----BEGIN RSA PRIVATE KEY----- MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIXEGmjn+2RcLYP8UiYfyswQrrkjNa7SfxxB9858k3uzkikLr7pj/4nf841l+lFH++37UhpdWU6h1YbVw1xCB4tm2wSP5YYFQR/1O5+8z2BGpbkGKObhzPVm9IO3HNtCPMBhJ53LlCIjv1FRaWOiFf7BMwMXyC5wlvsDjfVZlxTbAgMBAAECgYA8y6YdK+JL+MEPDazgeu6W1LY0mtYZQL5Yv3q7NE9rl2/Ei/UwR6aqqUhuaXzdWFQeE217YhXm8RK1F46U7cWzY4gXH0ogXZxroMJd5qQ7+fHywOmEb0RiAAYdmiDXPoOmoS8IeNEwowHSuRA4tCSAe+SbygZ41CVYzr3RFQIZsQJBAMGXcWqnUCnQIxLfMkCSNJ0saEcGDooznFWhErZfkFTH+XUwDIF1LtbBdu0GfgScpZctnarsIkiqUS1Xa+pUpb8CQQCw4230BPSx41rL3D3T9GcrdbvqFv122/rZh04A34WeCLK7/qKigteOOJLyI2Jwyei5xALJpSM3+k2zkj5CP2/lAkEAvRxHerw+ntnnqUPHPzSTmQYMR3UvNun7ydozAVyRDYDbuxJY5Q2n17ndhuVUrQSo7eltn85UH0/hRL2leZ9+2QJBAKD3dTlXwSyXzioxU3orsC7WRphxL1oYOJ/3Br64qSj0lWGKCImGM43SYbZDCPPGaSeS/U5uHix0dHzymgFDJRkCQB4TDQtI7fIPcYvUt2QyWMBzBhiGf2iym0u9kcNZvdphObtgC0btxpLTVm7GXLsrXFXPa1bPpfUe5wyYDlyMykM= -----END RSA PRIVATE KEY-----');
const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user._id);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      const decryptedChats = data.map(chat => ({
        ...chat,
        latestMessage: chat.latestMessage && {
          ...chat.latestMessage,
          content: decryptor.decrypt(chat.latestMessage.content)
        }
      }));
  
      setChats(decryptedChats); 
  
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
                {chat.latestMessage && (
                  <Text fontSize="xs">
                    <b>{chat.latestMessage.sender.name} : </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Text>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
