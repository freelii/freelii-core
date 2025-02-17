#!/usr/bin/env node

const { Command } = require('commander');
const dotenv = require('dotenv');
const { input, confirm, select } = require('@inquirer/prompts');
const { CoinsPHService, AnchorService, PaymentRail } = require('@freelii/anchors');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Using API Host:', process.env.COINS_PH_API_HOST);
const program = new Command();



// Hardcoded balances and rate for now
const BALANCES = {
    USD: 0,
    PHP: 0,
};


program
    .name('freelii')
    .description('CLI tool for Freelii operations')
    .version('0.0.1');

program
    .command('fx')
    .description('Check FX rates and execute trades')
    .argument('<currency>', 'Base currency (e.g., usd)')
    .action(async (currency) => {
        console.log('currency', currency);

        let sourceCurrency = "USD";
        let targetCurrency = "PHP";

        if (["usd", "usdc"].includes(currency.toLowerCase())) {
            sourceCurrency = "PHP";
            targetCurrency = "USDC";
        } else if (["php", "ph"].includes(currency.toLowerCase())) {
            sourceCurrency = "USDC";
            targetCurrency = "PHP";
        }


        const coinsPHService = new CoinsPHService();
        let account = await coinsPHService.getAccount();
        if (!account.success) {
            console.error('Error fetching account', account);
            console.error(account.error);
            return;
        }


        // Show current balances
        console.log('\n💰 Current Balances:');
        account.res.balances?.forEach((balance) => {
            BALANCES[balance.asset] = balance.free;
            console.log(`${balance.asset}: ${balance.free.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        });

        // Prompt for amount
        const amount = await input(
            {
                type: 'number',
                name: 'amount',
                message: `Enter the amount of ${sourceCurrency} you want to exchnage:`,
                validate: (value) => {
                    if (value <= 0) return 'Please enter a positive amount';
                    return true;
                }
            }
        );
        console.table({
            sourceCurrency: sourceCurrency,
            targetCurrency: targetCurrency,
            sourceAmount: amount.toString()
        });

        const quoteResponse = await coinsPHService.requestQuote({
            sourceCurrency: sourceCurrency,
            targetCurrency: targetCurrency,
            sourceAmount: amount.toString()
        });

        const targetAmount = quoteResponse.targetAmount;
        const exchangeRate = quoteResponse.exchangeRate;
        const quoteId = quoteResponse.quoteId;
        const sourceAmount = quoteResponse.sourceAmount;

        console.log('quoteResponse', quoteResponse);
        console.log('targetAmount', targetAmount);
        console.log('sourceAmount', sourceAmount);
        console.log('exchangeRate', exchangeRate);
        console.log('quoteId', quoteId);



        console.log('\n📊 Quote Summary:');
        console.log(`You will get: ${targetAmount} ${targetCurrency} for ${sourceAmount} ${sourceCurrency}`);
        console.log(`Rate: ${exchangeRate}`);

        // Confirm transaction
        const shouldProceed = await confirm({
            message: 'Would you like to proceed with this exchange?',
        });
        if (shouldProceed) {
            const confirm = await coinsPHService.acceptQuote(quoteId);
            console.log(confirm);
            if (!confirm.success) {
                console.error('Error confirming quote', confirm);
                console.error(confirm.error);
                return;
            }
            // In a real implementation, this would call an API
            console.log('\n✅ Transaction completed!');
            console.log(`\n${amount.toLocaleString(undefined, { style: 'currency', currency: targetCurrency === "USDC" ? "USD" : targetCurrency })} deposited to your account!`);
            console.log(`\nConversion Cost: ${sourceAmount.toLocaleString(undefined, { style: 'currency', currency: sourceCurrency === "USDC" ? "USD" : sourceCurrency })}!`);

            account = await coinsPHService.getAccount();
            // Show current balances
            console.log('\n💰 New Balances:');
            account.res?.balances?.forEach((balance) => {
                console.log(`${balance.asset}: ${balance.free.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            });
        } else {
            console.log('\n❌ Transaction cancelled');
        }
    });

program
    .command('orchestrate')
    .description('Orchestrate a trade')
    .argument('<currency>', 'Base currency (e.g., usd)')
    .action(async (currency) => {
        console.log('currency', currency);

        let sourceCurrency = "USD";
        let targetCurrency = "PHP";

        if (["usd", "usdc"].includes(currency.toLowerCase())) {
            sourceCurrency = "PHP";
            targetCurrency = "USDC";
        } else if (["php", "ph"].includes(currency.toLowerCase())) {
            sourceCurrency = "USDC";
            targetCurrency = "PHP";
        }


        const coinsPHService = new CoinsPHService();
        let account = await coinsPHService.getAccount();
        if (!account.success) {
            console.error('Error fetching account', account);
            console.error(account.error);
            return;
        }


        // Show current balances
        console.log('\n💰 Current Balances:');
        account.res.balances?.forEach((balance) => {
            BALANCES[balance.asset] = balance.free;
            console.log(`${balance.asset}: ${balance.free.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        });



        // Prompt for amount
        const amount = await input(
            {
                type: 'number',
                name: 'amount',
                message: `Enter the amount of ${targetCurrency} you want to receive:`,
                validate: (value) => {
                    if (value <= 0) return 'Please enter a positive amount';
                    if (value > BALANCES[targetCurrency]) return 'Insufficient balance';
                    return true;
                }
            }
        );
        console.table({
            sourceCurrency: sourceCurrency,
            targetCurrency: targetCurrency,
            targetAmount: amount.toString()
        });



        console.log('Orchestrating...');
        const anchorService = new AnchorService();
        const { anchor, quote } = await anchorService.getOptimalAnchor(
            amount,
            sourceCurrency,
            targetCurrency,
            PaymentRail.CRYPTO
        );

        console.log({
            sourceCurrency: sourceCurrency,
            targetCurrency: targetCurrency,
            targetAmount: amount.toString(), quote
        })

        const targetAmount = amount;
        const sourceAmount = amount / quote.exchangeRate;



        console.log('\n📊 Quote Summary:');
        console.log(`You will get: ${targetAmount.toLocaleString(undefined, { style: 'currency', currency: targetCurrency === "USDC" ? "USD" : targetCurrency })} for ${sourceAmount.toLocaleString(undefined, { style: 'currency', currency: sourceCurrency === "USDC" ? "USD" : sourceCurrency })}`);
        console.log(`Rate: ${quote.exchangeRate}`);

        // Confirm transaction
        const shouldProceed = await confirm({
            message: 'Would you like to proceed with this exchange?',
        });
        if (shouldProceed) {
            const confirm = await coinsPHService.acceptQuote(quote.quoteId);
            console.log(confirm);
            if (!confirm.success) {
                console.error('Error confirming quote', confirm);
                console.error(confirm.error);
                return;
            }
            // In a real implementation, this would call an API
            console.log('\n✅ Transaction completed!');
            console.log(`\n${amount.toLocaleString(undefined, { style: 'currency', currency: targetCurrency === "USDC" ? "USD" : targetCurrency })} deposited to your account!`);
            console.log(`\nConversion Cost: ${sourceAmount.toLocaleString(undefined, { style: 'currency', currency: sourceCurrency === "USDC" ? "USD" : sourceCurrency })}!`);

            account = await coinsPHService.getAccount();
            if (!account.success) {
                console.error('Error fetching account', account);
                console.error(account.error);
                return;
            }

            // Show new balances
            console.log('\n💰 New Balances:');
            account.res?.balances?.forEach((balance) => {
                BALANCES[balance.asset] = balance.free;
                console.log(`${balance.asset}: ${balance.free.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            });

        } else {
            console.log('\n❌ Transaction cancelled');
        }
    });

program.command('cashout')
    .description('Cashout to a recipient')
    .action(async () => {
        // Channel options
        const CHANNEL_OPTIONS = [
            { value: 'INSTAPAY', label: 'Instapay' },
            { value: 'PESONET', label: 'PESONet' }
        ];

        const CHANNEL_SUBJECT_OPTIONS = [
            { value: 'coins.ph', label: 'Coins.ph' },
            { value: 'gcash', label: 'GCash' },
            { value: 'unionbank', label: 'UnionBank' },
            { value: 'bpi', label: 'BPI' },
            { value: 'bdo', label: 'BDO' }
        ];

        // Generate random internal order ID
        const internalOrderId = Math.random().toString(36).substring(2, 15);

        // Interactive prompts
        const amount = await input({
            message: 'Enter amount to cashout (PHP):',
            validate: (value) => {
                if (isNaN(value) || value <= 0) return 'Please enter a valid positive number';
                return true;
            }
        });

        const channelName = await select({
            message: 'Select payment channel:',
            choices: CHANNEL_OPTIONS
        });

        const channelSubject = await select({
            message: 'Select bank/payment provider:',
            choices: CHANNEL_SUBJECT_OPTIONS
        });

        const recipientName = await input({
            message: 'Enter recipient name:',
            default: 'testing',
            validate: (value) => value.length > 0 ? true : 'Recipient name is required'
        });

        const recipientAccountNumber = await input({
            message: 'Enter recipient account number:',
            default: '09171586897',
            validate: (value) => value.length > 0 ? true : 'Account number is required'
        });

        const recipientMobile = await input({
            message: 'Enter recipient mobile number (e.g., 09171234567):',
            default: '09171586897',
            validate: (value) => {
                if (!/^09\d{9}$/.test(value)) return 'Please enter a valid Philippine mobile number (e.g., 09171234567)';
                return true;
            }
        });

        const cashoutData = {
            internalOrderId,
            currency: "PHP",
            amount,
            channelName,
            channelSubject,
            recipientName,
            recipientAccountNumber,
            recipientMobile: `+63${recipientMobile.substring(1)}` // Convert 09XX to +639XX format
        };

        console.log('\n📝 Review your cashout details:');
        console.table(cashoutData);

        const shouldProceed = await confirm({
            message: 'Would you like to proceed with this cashout?',
        });

        if (shouldProceed) {
            const coinsPHService = new CoinsPHService();
            try {
                const cashoutResponse = await coinsPHService.cashout(cashoutData);

                if (cashoutResponse.success) {
                    console.log('\n✅ Cashout initiated successfully!');
                    console.log(cashoutResponse);
                } else {
                    console.error('\n❌ Cashout failed:', cashoutResponse.error);
                }
            } catch (error) {
                console.error('\n❌ Cashout failed:', error.message);
            }
        } else {
            console.log('\n❌ Cashout cancelled');
        }
    });

program.command('monitor')
    .description('Monitor a cashout')
    .argument('<internalOrderId>', 'Internal order ID')
    .action(async (internalOrderId) => {
        const coinsPHService = new CoinsPHService();
        const details = await coinsPHService.getFiatOrderDetails(internalOrderId);
        console.log(details);
    });


program.command('history')
    .description('Monitor a cashout')
    .action(async () => {
        const coinsPHService = new CoinsPHService();
        const history = await coinsPHService.getOrderHistory();
        console.log(history);

    });

program.command('get-deposit-address')
    .option('-e, --email <email>', 'Email')
    .argument('<coin>', 'Coin')
    .argument('<network>', 'Network')
    .description('Get a deposit address')
    .action(async (coin, network, options) => {
        const coinsPHService = new CoinsPHService();
        const address = await coinsPHService.getSubAccountDepositAddress({
            coin,
            network,
            email: options.email
        });
        console.log(address);
    });

program.command('get-liquidation-address')
    .description('Get a liquidation address')
    .action(async () => {
        const coinsPHService = new CoinsPHService();
        const address = await coinsPHService.getLiquidationAddress();
        console.log('Liquidation Address:', address);
    });

program.command('live-quote')
    .description('Get a live quote')
    .argument('<sourceCurrency>', 'Source currency')
    .argument('<targetCurrency>', 'Target currency')
    .action(async (sourceCurrency, targetCurrency) => {
        const coinsPHService = new CoinsPHService();
        const quote = await coinsPHService.getLiveQuote({
            sourceCurrency,
            targetCurrency
        });
        console.log(quote);
    });

program.command('account')
    .description('Get account details')
    .action(async () => {
        const coinsPHService = new CoinsPHService();
        const account = await coinsPHService.getAccount();
        console.log('Account:', account.res.balances);
    });


program.command('rate')
    .description('Get a rate')
    .argument('<sourceCurrency>', 'Source currency')
    .argument('<targetCurrency>', 'Target currency')
    .action(async (sourceCurrency, targetCurrency) => {
        const coinsPHService = new CoinsPHService();
        const rate = await coinsPHService.getRate({
            sourceCurrency,
            targetCurrency,
            sourceAmount: 1
        });
        console.log('Rate:', rate);
    });
program.parse();
