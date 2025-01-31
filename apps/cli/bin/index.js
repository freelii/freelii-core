#!/usr/bin/env node

const { Command } = require('commander');
const dotenv = require('dotenv');
const { input, confirm } = require('@inquirer/prompts');
const { CoinsPHService } = require('@freelii/anchors');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Using API Host:', process.env.COINS_PH_API_HOST);
const program = new Command();



// Hardcoded balances and rate for now
const BALANCES = {
    USD: 1000,
    PHP: 25000,
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
        const account = await coinsPHService.getAccount();
        // Show current balances
        console.log('\n💰 Current Balances:');
        account.balances.forEach((balance) => {
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

        const quoteResponse = await coinsPHService.getQuote({
            sourceCurrency: sourceCurrency,
            targetCurrency: targetCurrency,
            targetAmount: amount.toString()
        });
        if (!quoteResponse.success) {
            console.error('Error getting quote', quoteResponse);
            console.error(quoteResponse.error);
            return;
        }
        const quote = quoteResponse.res;

        console.log(quote);
        // Calculate quote
        const sourceAmount = Number(quote.sourceAmount);
        const targetAmount = Number(quote.targetAmount);

        console.log('\n📊 Quote Summary:');
        console.log(`You will get: ${targetAmount.toLocaleString(undefined, { style: 'currency', currency: targetCurrency === "USDC" ? "USD" : targetCurrency })} for ${sourceAmount.toLocaleString(undefined, { style: 'currency', currency: sourceCurrency === "USDC" ? "USD" : sourceCurrency })}`);
        console.log(`Rate: ${quote.price.toLocaleString(undefined, { style: 'currency', currency: sourceCurrency === "USDC" ? "USD" : sourceCurrency })}`);

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

            const account = await coinsPHService.getAccount();
            // Show current balances
            console.log('\n💰 New Balances:');
            account.balances.forEach((balance) => {
                console.log(`${balance.asset}: ${balance.free.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            });
        } else {
            console.log('\n❌ Transaction cancelled');
        }
    });

program.parse();
