#!/usr/bin/env node

const { Command } = require('commander');
const dotenv = require('dotenv');
const { input, confirm } = require('@inquirer/prompts');
const { CoinsPHService } = require('@freelii/anchors');

dotenv.config();

const program = new Command();

// Hardcoded balances and rate for now
const BALANCES = {
    USD: 1000,
    PHP: 25000,
};

const HARDCODED_RATE = 56.50; // 1 USD = 56.50 PHP

program
    .name('freelii')
    .description('CLI tool for Freelii operations')
    .version('0.0.1');

program
    .command('fx')
    .description('Check FX rates and execute trades')
    .argument('<currency>', 'Base currency (e.g., usd)')
    .action(async (currency) => {
        // Show current balances
        console.log('\n💰 Current Balances:');
        console.log(`USD: $${BALANCES.USD.toLocaleString()}`);
        console.log(`PHP: ₱${BALANCES.PHP.toLocaleString()}`);
        console.log(`Current Rate: $1 = ₱${HARDCODED_RATE}`);

        // Prompt for amount
        const amount = await input(
            {
                type: 'number',
                name: 'amount',
                message: 'Enter USD amount to convert to PHP:',
                validate: (value) => {
                    if (value <= 0) return 'Please enter a positive amount';
                    if (value > BALANCES.USD) return 'Insufficient USD balance';
                    return true;
                }
            }
        );
        console.log(amount);
        const coinsPHService = new CoinsPHService();
        coinsPHService.test();
        // Calculate quote
        const phpAmount = Number(amount) * HARDCODED_RATE;

        console.log('\n📊 Quote Summary:');
        console.log(`You will get: ₱${phpAmount.toLocaleString()}`);
        console.log(`Rate: ₱${HARDCODED_RATE}`);

        // Confirm transaction
        const shouldProceed = await confirm({
            message: 'Would you like to proceed with this exchange?',
        });
        if (shouldProceed) {
            // In a real implementation, this would call an API
            console.log('\n✅ Transaction completed!');
            console.log(`\n${amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} deposited to your account!`);
            console.log(`\nCost: ${phpAmount.toLocaleString(undefined, { style: 'currency', currency: 'PHP' })}!`);

            // Show new balances
            console.log('\n💰 New Balances:');
            console.log(`USD: $${(BALANCES.USD - amount).toLocaleString()}`);
            console.log(`PHP: ₱${(BALANCES.PHP + phpAmount).toLocaleString()}`);
        } else {
            console.log('\n❌ Transaction cancelled');
        }
    });

program.parse();
