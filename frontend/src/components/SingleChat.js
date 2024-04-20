import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { HStack } from '@chakra-ui/react';
import "./styles.css";
import { Button, IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import JSEncrypt from 'jsencrypt';
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
const ENDPOINT = "http://localhost:5000"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare;

let encryptor = new JSEncrypt();
let decryptor = new JSEncrypt();
encryptor.setPublicKey('-----BEGIN PUBLIC KEY----- MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCFxBpo5/tkXC2D/FImH8rMEK65IzWu0n8cQffOfJN7s5IpC6+6Y/+J3/ONZfpRR/vt+1IaXVlOodWG1cNcQgeLZtsEj+WGBUEf9TufvM9gRqW5Bijm4cz1ZvSDtxzbQjzAYSedy5QiI79RUWljohX+wTMDF8gucJb7A431WZcU2wIDAQAB -----END PUBLIC KEY-----');
// Set the private key
decryptor.setPrivateKey('-----BEGIN RSA PRIVATE KEY----- MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAIXEGmjn+2RcLYP8UiYfyswQrrkjNa7SfxxB9858k3uzkikLr7pj/4nf841l+lFH++37UhpdWU6h1YbVw1xCB4tm2wSP5YYFQR/1O5+8z2BGpbkGKObhzPVm9IO3HNtCPMBhJ53LlCIjv1FRaWOiFf7BMwMXyC5wlvsDjfVZlxTbAgMBAAECgYA8y6YdK+JL+MEPDazgeu6W1LY0mtYZQL5Yv3q7NE9rl2/Ei/UwR6aqqUhuaXzdWFQeE217YhXm8RK1F46U7cWzY4gXH0ogXZxroMJd5qQ7+fHywOmEb0RiAAYdmiDXPoOmoS8IeNEwowHSuRA4tCSAe+SbygZ41CVYzr3RFQIZsQJBAMGXcWqnUCnQIxLfMkCSNJ0saEcGDooznFWhErZfkFTH+XUwDIF1LtbBdu0GfgScpZctnarsIkiqUS1Xa+pUpb8CQQCw4230BPSx41rL3D3T9GcrdbvqFv122/rZh04A34WeCLK7/qKigteOOJLyI2Jwyei5xALJpSM3+k2zkj5CP2/lAkEAvRxHerw+ntnnqUPHPzSTmQYMR3UvNun7ydozAVyRDYDbuxJY5Q2n17ndhuVUrQSo7eltn85UH0/hRL2leZ9+2QJBAKD3dTlXwSyXzioxU3orsC7WRphxL1oYOJ/3Br64qSj0lWGKCImGM43SYbZDCPPGaSeS/U5uHix0dHzymgFDJRkCQB4TDQtI7fIPcYvUt2QyWMBzBhiGf2iym0u9kcNZvdphObtgC0btxpLTVm7GXLsrXFXPa1bPpfUe5wyYDlyMykM= -----END RSA PRIVATE KEY-----');
const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
        
      // setMessages(data);
      const decryptedMessages = data.map(message => ({
        ...message,
        content: decryptor.decrypt(message.content) 
      }));
  
      setMessages(decryptedMessages);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
  
    if (event.key === "Enter" && newMessage) {
     
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            content: encryptor.encrypt(newMessage),
            chatId: selectedChat,
          },
          config
        );  
        console.log("data", data);
        socket.emit("new message", data);
        
        // setMessages([...messages, data]);
        let decryptedMessage = decryptor.decrypt(data.content);

        // Update messages with the decrypted content
        setMessages([
          ...messages, 
          { ...data, content: decryptedMessage }
        ]);
        setNewMessage("");
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        // setMessages([...messages, newMessageRecieved]);
        let decryptedMessage = decryptor.decrypt(newMessageRecieved.content);

      // Update messages with the decrypted content
      setMessages([
        ...messages, 
        { ...newMessageRecieved, content: decryptedMessage }
      ]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
            
              <HStack spacing={2}>  
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                />
                <Button 
                  onClick={() => { 
                    const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13 });
                    sendMessage(event); 
             }}  
                  colorScheme="teal"    // Example styling
                >
                  Send
                </Button>
              </HStack>
              
              
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
