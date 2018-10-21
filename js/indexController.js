

class IndexController {

    constructor(container) {
        this._container = container;
        this.registerServiceWorker();
    }

    
    registerServiceWorker() {
        console.log('Registering SW .................');
        if (!navigator.serviceWorker) return;

        const indexController = this;

        navigator.serviceWorker.register('./sw.js').then(reg => {
            if (!navigator.serviceWorker.controller) {
                return;
            }

            if (reg.waiting) {
                indexController.updateReady(reg.waiting);
                return;
            }

            if (reg.installing) {
                indexController.trackInstalling(reg.installing);
                return;
            }

            reg.addEventListener('updatefound', function () {
                indexController.trackInstalling(reg.installing);
            });
        }).catch(error => console.log("SW not registered: ", error));

    }


    trackInstalling(worker) {
        const indexController = this;
        worker.addEventListener('statechange', function () {
            if (worker.state == 'installed') {
                indexController.updateReady(worker);
            }
        });
    }


    updateReady(worker) {
        const ok = confirm("New version available online. Do you want to refresh? ");
        if (ok) {
            worker.postMessage({ action: 'skipWaiting' });

        };
    }





}//end of class