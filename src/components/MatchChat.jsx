import { useEffect, useState } from "react";
import { Channel, MessageList, MessageInput, Thread, Window, Chat } from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

export default function MatchChat({ chatClient, chatChannel }) {
    const [channel, setChannel] = useState(null);

    useEffect(() => {
        if (chatClient && chatChannel) {
            setChannel(chatChannel);
        }
    }, [chatClient, chatChannel]);

    if (!channel)
        return null;

    return (
        <div className="chat-container mt-3 border rounded p-3 bg-light">
            <Chat client={chatClient} theme="messageing light">
                <Channel channel={chatChannel}>
                    <Window>
                        <MessageList />
                        <MessageInput focus />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    );
}