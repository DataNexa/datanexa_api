import Config from "../../../util/config";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBmoAz2-Wac5YFYofudJdaL7638bfuX5cA",
    authDomain: "datanexa-d3958.firebaseapp.com",
    projectId: "datanexa-d3958",
    storageBucket: "datanexa-d3958.appspot.com",
    messagingSenderId: "858047127787",
    appId: "1:858047127787:web:ccef4e575a7335ad1c1eae",
    measurementId: "G-LZNF4BM45J"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const serverKey = Config.instance().getData().key_push

const sendPushNotification = async (fcmTokens: string[], message: { title: string; body: string; icon?: string }) => {

    const maxTokensLimit = 500;

    const grupoDeTokens = [];
    for (let i = 0; i < fcmTokens.length; i += maxTokensLimit) {
        grupoDeTokens.push(fcmTokens.slice(i, i + maxTokensLimit));
    }

    for (const grupo of grupoDeTokens) {
        try {
            const response = await fetch('https://fcm.googleapis.com/fcm/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=${serverKey}`, 
                },
                body: JSON.stringify({
                    registration_ids: grupo, 
                    notification: {
                        title: message.title,
                        body: message.body,
                        icon: message.icon || 'default-icon-url', 
                    },
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Notificação enviada com sucesso:', data);
            } else {
                console.error('Erro ao enviar notificação:', data);
            }
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
        }
    }

};


export default sendPushNotification