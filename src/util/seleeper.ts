export default {

    secureSleep(ms: number = 1000) {
        return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + ms));
    },

    sleep(ms: number = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}