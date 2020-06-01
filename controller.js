const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://broker.hivemq.com')

var garageState = ''
var connected = false

client.on('connect', () => {
    client.subscribe('garage/connected')
    client.subscribe('garage/state')
})

client.on('message', (topic, message) => {
    switch(topic) {
        case 'garage/connected': 
            return handlerGarageConnected(message)
        case 'garage/state': 
            return handlerGarageState(message)
    }
    console.log('Sem nenhum handler para o tópico %s', topic)
})

function handlerGarageConnected(message) {
    console.log('Garage connected status %s', message)
    connected = (message.toString() === 'true')
}

function handlerGarageState(message) {
    garageState = message
    console.log('Status da garagem atualizada para %s', message)
}

function openGarageDoor() {
    if (connected && garageState !== 'open') {
        client.publish('garage/open', 'true')
    }
}

function closeGarageDoor() {
    if (connected && garageState === 'closed') {
        client.publish('garage/close', 'true')
    }
}

setTimeout(() => {
    console.log('Porta aberta!')
    openGarageDoor()
}, 5000)

setTimeout(() => {
    console.log('Porta fechada!')
    closeGarageDoor()
}, 20000)