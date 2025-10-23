import { useEffect, useState } from "react";
import { Channel, Chat, MessageList, MessageInput, Thread, Window } from "stream-chat-react";
import { Button, Modal } from "react-bootstrap";
import "stream-chat-react/dist/css/v2/index.css";

export default function MatchChat({ chatClient, chatChannel, show, onClose }) {
    const [channel, setChannel] = useState(null);

    useEffect(() => {
        if (chatClient && chatChannel) {
            setChannel(chatChannel);
        }
    }, [chatClient, chatChannel]);

    if (!channel)
        return null;

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>💬 Match Chat</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ height: "500px" }}>
                <Chat client={chatClient} theme="messaging light">
                    <Channel channel={chatChannel}>
                        <Window>
                            <MessageList />
                            <MessageInput focus />
                        </Window>
                        <Thread />
                    </Channel>
                </Chat>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}