"use client";
import { useState, useEffect, useCallback } from 'react'
import ROSLIB from 'roslib'
import { Button, Form } from 'react-bootstrap';

// ROS接続URL
const ROS_CONNECTION_URL = 'ws://127.0.0.1:9090';

type TopicMessage = {
    [key: string]: string
}

type NewTopic = {
    name: string
    messageType: string
}

export default function Home() {
    const [ros, setRos] = useState<ROSLIB.Ros | null>(null)
    const [messages, setMessages] = useState<TopicMessage>({})
    const [newTopic, setNewTopic] = useState<NewTopic>({ name: '', messageType: '' })

    const subscribeToTopic = useCallback((topicName: string, messageType: string) => {
        if (!ros) { return; }
        const listener = new ROSLIB.Topic({
            ros: ros,
            name: topicName,
            messageType: messageType
        })
        listener.subscribe((message: any) => {
            setMessages(prev => ({
                ...prev,
                [topicName]: JSON.stringify(message)
            }))
        })
    }, [ros])

    useEffect(() => {
        if (ros) {
            subscribeToTopic('/chatter', 'std_msgs/String')
        }
    }, [ros, subscribeToTopic])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(newTopic);
        try {
            const response = await fetch('@/app/api/subscribe-topic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTopic),
            })
            const data = await response.json()
            console.log(data);
            if (data.success) {
                subscribeToTopic(newTopic.name, newTopic.messageType)
                setNewTopic({ name: '', messageType: '' })
            }
        } catch (error) {
            console.error('Error adding new topic:', error)
        }
    }

    return (
        <div>
        <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTopicName">
                <Form.Label>Topic Name</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter Topic Name"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                />
            </Form.Group>
            <Form.Group controlId="formMessageType">
                <Form.Label>Message Type</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Enter Message Type"
                    value={newTopic.messageType}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, messageType: e.target.value }))}
                />
            </Form.Group>
            <Button variant="primary" type="submit">
                Add Topic
            </Button>
        </Form>

        <h2>Received Messages:</h2>
        {Object.entries(messages).map(([topic, message]) => (
            <div key={topic}>
            <h3>{topic}</h3>
            <p>{message}</p>
            </div>
        ))}
        </div>
    )
}