import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';

const WebSocketScreen = () => {
    const [message, setMessage] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
    const WS_URL = 'ws://172.16.15.0:82';
    const RECONNECT_INTERVAL = 1000; // 1 seconds
    useEffect(() => {
        const connectWebSocket = () => {
            console.log("🔄 Connecting to WebSocket...");
            const websocket = new WebSocket(WS_URL);

            websocket.onopen = () => console.log('✅ WebSocket Connected');
            websocket.onmessage = (event) => setMessage(event.data);
            websocket.onerror = (error) => console.error('❌ WebSocket Error:', error);
            websocket.onclose = () => {
                console.warn('⚠️ WebSocket Closed. Reconnecting in 3s...');
                reconnectTimeout.current = setTimeout(connectWebSocket, RECONNECT_INTERVAL);
            };

            wsRef.current = websocket;
        };

        connectWebSocket();

        return () => {
            wsRef.current?.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        };
    }, []);

    const sendMessage = (msg: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(msg);
        } else {
            console.warn("⚠️ WebSocket not connected, can't send message");
        }
    };

    const handleCarMove = (msg: string) => sendMessage(msg);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.controls}>
                <View style={styles.controlColumn}>
                    <TouchableOpacity onPress={() => handleCarMove("U")} style={styles.button}><Text>↑</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleCarMove("D")} style={styles.button}><Text>↓</Text></TouchableOpacity>
                </View>
                <View style={styles.controlRow}>
                    <TouchableOpacity onPress={() => handleCarMove("L")} style={styles.button}><Text>←</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleCarMove("R")} style={styles.button}><Text>→</Text></TouchableOpacity>
                </View>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userText}>Message: {message}</Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f5f5f5',
    },
    button: {
        backgroundColor: '#3498db',
        padding: 25,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        paddingHorizontal: 20,
    },
    controlColumn: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfo: {
        marginTop: 20,
    },
    userText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default WebSocketScreen;
