"use client";
import { useState, useEffect, useCallback } from 'react'
import ROSLIB from 'roslib'
import { Button } from 'react-bootstrap';

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
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [messages, setMessages] = useState<TopicMessage>({})
    const [newTopic, setNewTopic] = useState<NewTopic>({ name: '', messageType: '' })

    const startConnect = () => {
        console.log('ROS Operator: Try connection...');
        setIsConnected(false);
        setRos(new ROSLIB.Ros({url:ROS_CONNECTION_URL}));
    }

    useEffect(() => {
        if (ros === null) { return; }
        ros.on('connection', () => {
            console.log('Connected to ROSBridge Server')
            setIsConnected(true)
        })
        ros.on('error', (error) => {
            console.error('Error connecting to ROSBridge Server:', error)
            setIsConnected(false)
        })
        ros.on('close', () => {
            console.log('Connection to ROSBridge Server closed')
            setIsConnected(false)
        })
    }, [ros])

    const subscribeToTopic = useCallback((topicName: string, messageType: string) => {
        if (!ros) return
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
            const response = await fetch('/api/subscribe-topic', {
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
        <h1>ROS 2 Web Subscriber</h1>
        <Button
            variant={!isConnected ? "primary" : "secondary"}
            disabled={isConnected}
            onClick={!isConnected ? startConnect : undefined}
        >
            ROS接続開始
        </Button>
        <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Topic Name"
                value={newTopic.name}
                onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
                type="text"
                placeholder="Message Type"
                value={newTopic.messageType}
                onChange={(e) => setNewTopic(prev => ({ ...prev, messageType: e.target.value }))}
            />
            <button type="submit">Add Topic</button>
        </form>

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