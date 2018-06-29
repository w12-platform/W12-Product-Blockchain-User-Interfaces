import AdminDashboard from './components/AdminDashboad/index.js';
import ledger from './lib/Blockchain/ContractsLedger.js';
import config from './config.js';
import { promisify } from './lib/utils.js';

ledger
	.then(({ W12Lister }) => {
		const deployed = W12Lister.instance.at(config.contracts.W12Lister.address);
		const approvedTokensLength = promisify(deployed.approvedTokensLength.bind(deployed));

        approvedTokensLength()
			.then(result => console.log(result), error => console.log(error));
	});

const View = new Vue({
    el: '#app',
    components: {
        AdminDashboard
    }
});

