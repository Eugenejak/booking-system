import { StreamChat } from "stream-chat";

let chatClient = null;

export const connectStreamChat = async (currentUser) => {
    try {
        if (!chatClient) {
            // get token from backend
            const response = await fetch(
                `https://36da2f3f-0646-437a-b0b3-41d43b7682db-00-2bbdx267zl8kv.pike.replit.dev/stream-token?userId=${currentUser.uid}`
            );
            const data = await response.json();

            if (!data.token) throw new Error("No token returned from backend");

            // connect to Stream Chat client
            chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

            await chatClient.connectUser(
                {
                    id: currentUser.uid,
                    name: currentUser.displayName,
                },
                data.token
            );
            console.log("✅ Connected to Stream Chat as:", currentUser.displayName);
        }
        return chatClient;
    } catch (error) {
        console.error("Error connecting to chat:", error);
    }
};

export const disconnectStreamChat = async () => {
    if (chatClient) {
        await chatClient.disconnectStreamChat();
        chatClient = null;
        console.log("✅ Stream Chat disconnected");
    }
};