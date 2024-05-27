import React, { useEffect, useState, useContext } from 'react';
import mqtt from 'mqtt';
import { BeaconContext } from '../../Context/BeaconProvider';

export const Mqttdata = () => {
    const { addMqttData } = useContext(BeaconContext);
    const [mqttClient, setMqttClient] = useState(null);

    useEffect(() => {
        const client = mqtt.connect('mqtt://localhost:9001');
        setMqttClient(client);

        client.on('connect', () => {
            console.log('Cliente MQTT conectado');
            client.subscribe('/gw/ac233fc18d06/status');
            client.subscribe('/gw/ac233fc18cfb/status');
            client.subscribe('/gw/ac233fc18d08/status');
            client.subscribe('/gw/ac233fc18cff/status'); // Nuevo gateway
        });

        client.on('message', (topic, message) => {
            const parsedMessage = JSON.parse(message.toString());
            if (topic === '/gw/ac233fc18d06/status' || topic === '/gw/ac233fc18cfb/status' || topic === '/gw/ac233fc18d08/status' || topic === '/gw/ac233fc18cff/status') {
                saveDataToServer(topic, parsedMessage);
            }
        });

        return () => {
            console.log('Desconectando cliente MQTT...');
            client.end();
        };
    }, []);

    const saveDataToServer = async (topic, data) => {
        try {
            const response = await fetch('http://localhost:3000/mqtt/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic,
                    message: JSON.stringify(data)
                })
            });

            if (!response.ok) {
                const errorMessage = `Error al enviar datos al servidor: ${response.status} - ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const responseData = await response.json();
            console.log('Respuesta del servidor:', responseData);
        } catch (error) {
            console.error('Detalles del error:', error.message);
        }
    };

    return null;
};
