import React, { useEffect, useState, useContext } from 'react';
import mqtt from 'mqtt';
import axios from 'axios';
import { BeaconContext } from '../../Context/BeaconProvider';

export const Mqttdata = () => {
    const { addMqttData } = useContext(BeaconContext);
    const [mqttClient, setMqttClient] = useState(null);
    const [gatewayMacAddresses, setGatewayMacAddresses] = useState([]);

    useEffect(() => {
        const fetchGateways = async () => {
            try {
                const response = await axios.get('http://localhost:3000/gatewayregister');
                const macAddresses = response.data.map(gateway => gateway.MacAddress);
                
                console.log("tabla Gateway", macAddresses)

                setGatewayMacAddresses(macAddresses);
            } catch (error) {
                console.error('Error al obtener gateways:', error);
            }
        };

        fetchGateways();
    }, []);

    useEffect(() => {
        if (gatewayMacAddresses.length === 0) return;

        const client = mqtt.connect('ws://localhost:9001');
        setMqttClient(client);

        client.on('connect', () => {
            console.log('Cliente MQTT conectado');
            gatewayMacAddresses.forEach((macAddress,i) => {
                client.subscribe(`/gw/${macAddress.toLowerCase()}/status`);
            });
        });

        client.on('message', (topic, message) => {
            const parsedMessage = JSON.parse(message.toString());
            if (topic.startsWith('/gw/')) {
                saveDataToServer(topic, parsedMessage);
            }
        });

        return () => {
            console.log('Desconectando cliente MQTT...');
            client.end();
        };
    }, [gatewayMacAddresses]);

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
