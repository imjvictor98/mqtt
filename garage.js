const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://broker.hivemq.com')

/**
 * O estado da garagem, por padrão é fechado
 * Possíveis estados: fechado, aperto, abrindo, fechando
 */

var state = 'closed'


client.on('connect', () => {
    client.subscribe('garage/open')
    client.subscribe('garage/close')

    //Informar a controller que a garagem está conectada
    client.publish('garage/connected', 'true')
    sendStateUpdate()
})

client.on('message', (topic, message) => {
    console.log('Mensagem recebida %s %s', topic, message)

    switch(topic) {
        case 'garage/open': 
            return handlerOpenRequest(message)
        case 'garage/close': 
            return handlerCloseRequest(message)
    }
})

function sendStateUpdate() {
    console.log('Enviando estado %s', state)
    client.publish('garage/state', state)
}

function handlerOpenRequest(message) {
    if (state !== 'open' && state !== 'opening') {
        console.log('Abrindo a porta da garagem')
        state = 'opening'
        sendStateUpdate()

        setTimeout(() => {
            state = 'open'
            sendStateUpdate()
        }, 5000)
    }
}

function handlerCloseRequest(message) {
    if (state !== 'closed' && state !== 'closing') {
        state = 'closing'
        sendStateUpdate()

        setTimeout(() => {
            state = 'closed'
            sendStateUpdate()
        }, 5000)
    }
}

function handleAppExit(options, err) {
    if (err) {
        console.log(err.stack)
    }

    if (options.cleanup) {
        client.publish('garage/connected', 'false')
    }

    if (options.exit) {
        process.exit()
    }
}


process.on('exit', handleAppExit.bind(null, {
    cleanup: true
}))

process.on("SIGINT", handleAppExit.bind(null, {
    exit: true
}))


process.on("uncaughtException", handleAppExit.bind(null, {
    exit: true
}))