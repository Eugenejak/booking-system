import { StreamChat } from "stream-chat";

let chatClient = null;

export const connectStreamChat = async (currentUser) => {
    try {
        if (!chatClient) {
            // get token from backend
            const response = await fetch(
                `https://vercel-bookingsystem-api.vercel.app/stream-token?userId=${currentUser.uid}`
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