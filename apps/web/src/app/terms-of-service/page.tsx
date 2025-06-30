
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
    return (
        <main className="min-h-screen flex flex-col bg-white text-black relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                {/* Grid overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

                {/* Refined gradient background */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_800px_600px_at_50%_-100px,rgba(120,119,198,0.15),transparent)]" />

                {/* Subtle color accent */}
                <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl opacity-30" />
            </div>

            {/* Navigation */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-8 pt-6">
                <Link href="/" className="inline-flex items-center text-xs hover:opacity-80 transition-opacity">
                    <ArrowLeft className="w-3 h-3 mr-2" />
                    Home
                </Link>
            </div>

            {/* Trust indicators */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-8 pt-4">
                <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Legal Document - Public Beta</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Powered by Stellar Network</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-8 py-12 prose prose-gray dark:prose-invert">
                {/* Hero section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full text-xs text-red-700 font-medium mb-6">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Beta Service Agreement
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                        <span className="block bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Terms of Service
                        </span>
                    </h1>

                    <div className="relative mb-6">
                        <h2 className="text-xl lg:text-2xl font-bold">
                            <span className="bg-gradient-to-r from-[#4ab3e8] to-[#63c6f5] bg-clip-text text-transparent">
                                —Freelii Public Beta
                            </span>
                        </h2>
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-[#4ab3e8] to-[#63c6f5]"></div>
                    </div>

                    <p className="text-gray-600 text-base leading-relaxed max-w-2xl mx-auto">
                        Please read these terms carefully before using Freelii. By accessing our service, you agree to be bound by these terms.
                    </p>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 dark:bg-red-900/20 dark:border-red-500">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                <strong>IMPORTANT BETA NOTICE:</strong> Freelii is currently in public beta testing. This service is experimental and may contain bugs or security vulnerabilities. Use at your own risk and only on testnet environments unless you fully understand and accept the risks.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
                    <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                </p>

                <section className="mb-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Freelii (&quot;the Service&quot;, &quot;the Wallet&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
                        If you do not agree to these Terms, do not use the Service.
                    </p>
                    <p>
                        Freelii is a non-custodial cryptocurrency wallet built on the Stellar blockchain that enables peer-to-peer payments,
                        remittances, and DeFi access through messaging platforms like Viber and Telegram.
                    </p>
                </section>

                <section className="mb-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Beta Service Disclaimer</h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 dark:bg-yellow-900/20 dark:border-yellow-500">
                        <p className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">CRITICAL BETA WARNINGS:</p>
                        <ul className="list-disc pl-5 text-yellow-700 dark:text-yellow-300 space-y-1">
                            <li>This is a PUBLIC BETA version - the service is experimental and not ready for production use</li>
                            <li>Features may be incomplete, unstable, or may not work as expected</li>
                            <li>Data loss, transaction failures, or loss of funds may occur</li>
                            <li>The service may be discontinued at any time without notice</li>
                            <li><strong>USE TESTNET ONLY - Mainnet use is strongly discouraged and done at your own risk</strong></li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Smart Contract and Security Risks</h2>
                    <p>
                        Freelii utilizes smart contracts deployed on the Stellar blockchain. While our smart contracts are open source
                        and available at{' '}
                        <a
                            href="https://github.com/freelii/passkey-kit/releases/tag/v0.1.3_contracts_smart-wallet_pkg0.4.5_cli22.8.1"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            our GitHub repository
                        </a>, you acknowledge and accept the following risks:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>No Security Audit:</strong> Our smart contracts have NOT been professionally audited for security vulnerabilities</li>
                        <li><strong>Code Risks:</strong> Despite being developed with best intentions, our code may contain bugs or vulnerabilities</li>
                        <li><strong>Loss of Funds:</strong> Smart contract bugs could result in permanent loss of your cryptocurrency</li>
                        <li><strong>No Recovery:</strong> Due to the immutable nature of blockchain transactions, lost funds cannot be recovered</li>
                        <li><strong>Experimental Technology:</strong> PassKey integration and Soroban smart contracts are cutting-edge technologies with inherent risks</li>
                    </ul>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 dark:bg-red-900/20 dark:border-red-500">
                        <p className="font-semibold text-red-800 dark:text-red-300">
                            RECOMMENDATION: Only use small amounts for testing purposes and primarily on testnet environments.
                        </p>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Soroban Hooks Integration</h3>
                        <p className="mb-4">
                            Freelii uses Soroban Hooks as an indexer to track wallet state changes and transaction history.
                            You acknowledge and accept the following regarding this integration:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Third-Party Dependency:</strong> Soroban Hooks is a third-party service outside of our direct control</li>
                            <li><strong>Data Delays:</strong> Soroban Hooks may experience delays in updating wallet data and transaction information</li>
                            <li><strong>No Liability for Misuse:</strong> We are NOT responsible for any misuse, errors, or issues arising from Soroban Hooks&apos; operation</li>
                            <li><strong>User Validation Required:</strong> You should ALWAYS validate your wallet state using official Stellar explorers or RPC endpoints of your choice</li>
                            <li><strong>Independent Verification:</strong> Do not rely solely on data provided through our Soroban Hooks integration</li>
                        </ul>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 dark:bg-blue-900/20 dark:border-blue-500">
                            <p className="font-semibold text-blue-800 dark:text-blue-300">
                                <strong>IMPORTANT:</strong> Always cross-reference your wallet state and transactions using
                                official Stellar network explorers or direct RPC calls for accurate, real-time information.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Domain Dependency and Account Access Risks</h2>
                    <p>
                        Freelii uses PassKey technology for authentication, which is inherently tied to our domain (freelii.app).
                        This creates specific risks that you must understand and accept:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Domain Dependency:</strong> Your PassKey authentication is directly linked to the &quot;freelii.app&quot; domain</li>
                        <li><strong>Domain Loss Risk:</strong> If we lose control of the freelii.app domain for any reason (expiration, legal disputes, technical issues, etc.), you may lose access to your account</li>
                        <li><strong>Account Recovery Limitations:</strong> If domain access is lost, we may not be able to help users recover their accounts or funds</li>
                        <li><strong>No Domain Guarantees:</strong> While we will make reasonable efforts to maintain control of our domain, we cannot guarantee perpetual ownership</li>
                    </ul>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 dark:bg-red-900/20 dark:border-red-500">
                        <p className="font-semibold text-red-800 dark:text-red-300">
                            <strong>CRITICAL RISK:</strong> Loss of domain access could result in permanent loss of access to your wallet and funds.
                            Freelii shall NOT be held responsible or liable for any losses resulting from domain-related access issues,
                            regardless of the cause. Use this service only if you accept this risk.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">5. Incomplete Features and Functionality</h2>
                    <p>
                        Several features advertised or mentioned in our marketing materials are NOT fully implemented in this beta version:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li><strong>Fiat On/Off Ramps:</strong> Crypto-to-fiat and fiat-to-crypto conversion features are incomplete or non-functional</li>
                        <li><strong>Partner Anchor Integrations:</strong> Anchor partner integrations have NOT been fully integrated - only native Stellar blockchain transactions are currently supported</li>
                        <li><strong>Third-Party Integrations:</strong> Integrations with Circle, Stripe, Coins.ph, GCash, PayMaya, and other providers are in development</li>
                        <li><strong>DeFi Features:</strong> Advanced DeFi functionalities may be limited or unavailable</li>
                        <li><strong>Cross-Platform Support:</strong> Full Viber and Telegram integration may not be available</li>
                    </ul>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4 dark:bg-orange-900/20 dark:border-orange-500">
                        <p className="font-semibold text-orange-800 dark:text-orange-300">
                            WARNING: Attempting to use incomplete fiat transfer features may result in loss of funds.
                            Do not send money expecting these features to work. Only Stellar blockchain transactions are currently functional,
                            and all blockchain transactions carry inherent risks of permanent loss.
                        </p>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">6. Non-Custodial Nature and User Responsibility</h2>
                    <p>
                        Freelii is a NON-CUSTODIAL wallet, which means:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>You maintain complete control and ownership of your private keys and funds</li>
                        <li>We do NOT have access to your private keys, PassKeys, or funds</li>
                        <li>We CANNOT recover your funds if you lose access to your PassKey or account</li>
                        <li>We CANNOT reverse, cancel, or refund transactions</li>
                        <li>You are solely responsible for the security of your PassKey and account credentials</li>
                        <li>You are responsible for understanding the risks of cryptocurrency and blockchain technology</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">7. User Obligations and Prohibited Uses</h2>
                    <p>By using Freelii, you agree to:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Use the service only for lawful purposes and in compliance with applicable laws</li>
                        <li>Not use the service for money laundering, terrorism financing, or other illegal activities</li>
                        <li>Not attempt to exploit bugs or vulnerabilities for personal gain</li>
                        <li>Not interfere with the operation of the service or other users&apos; accounts</li>
                        <li>Provide accurate information when required</li>
                        <li>Keep your PassKey and account credentials secure</li>
                        <li>Accept full responsibility for all transactions and activities on your account</li>
                    </ul>
                </section>

                <section className="mb-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. Limitation of Liability</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-900/20 dark:border-gray-500">
                        <p className="font-semibold mb-2">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>FREELII AND ITS DEVELOPERS DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED</li>
                            <li>WE ARE NOT LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES</li>
                            <li>WE ARE NOT LIABLE FOR LOSS OF FUNDS, DATA LOSS, OR ANY OTHER LOSSES</li>
                            <li>YOUR USE OF THE SERVICE IS AT YOUR OWN RISK</li>
                            <li>YOU ASSUME FULL RESPONSIBILITY FOR ANY MISUSE OR LOSSES</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. Testnet vs Mainnet Usage</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-500">
                        <p className="font-semibold text-blue-800 dark:text-blue-300 mb-2">STRONGLY RECOMMENDED:</p>
                        <ul className="list-disc pl-5 text-blue-700 dark:text-blue-300 space-y-1">
                            <li>Use Stellar TESTNET for all testing and experimentation</li>
                            <li>Testnet tokens have no real value and are safe for testing</li>
                            <li>Familiarize yourself with all features on testnet before considering mainnet use</li>
                        </ul>
                        <p className="font-semibold text-red-800 dark:text-red-300 mt-4">MAINNET WARNING:</p>
                        <ul className="list-disc pl-5 text-red-700 dark:text-red-300 space-y-1">
                            <li>Mainnet use involves real cryptocurrency with real value</li>
                            <li>Any losses on mainnet are permanent and irreversible</li>
                            <li>Use mainnet only if you fully understand and accept all risks</li>
                        </ul>
                    </div>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">10. Privacy and Data Collection</h2>
                    <p>
                        As a non-custodial wallet, we minimize data collection. However, we may collect:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Basic usage analytics to improve the service</li>
                        <li>Error logs for debugging purposes</li>
                        <li>Communication data when you contact support</li>
                    </ul>
                    <p className="mt-4">
                        We do not collect or store your private keys, PassKeys, or transaction details.
                        Refer to our Privacy Policy for detailed information about data handling.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">11. Regulatory Compliance</h2>
                    <p>
                        You are responsible for ensuring your use of Freelii complies with all applicable laws and regulations
                        in your jurisdiction, including but not limited to:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Anti-money laundering (AML) regulations</li>
                        <li>Know Your Customer (KYC) requirements</li>
                        <li>Tax reporting obligations</li>
                        <li>Securities and commodity trading regulations</li>
                        <li>Cross-border payment regulations</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">12. Service Modifications and Termination</h2>
                    <p>We reserve the right to:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Modify, suspend, or discontinue the service at any time without notice</li>
                        <li>Update these Terms of Service with reasonable notice</li>
                        <li>Terminate your access if you violate these terms</li>
                        <li>Change features, functionality, or supported platforms</li>
                    </ul>
                    <p className="mt-4">
                        Given the beta nature of the service, we may make significant changes or discontinue
                        the service as we prepare for full production launch.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">13. Support and Communication</h2>
                    <p>
                        Beta support is provided on a best-effort basis. While we strive to assist users,
                        we cannot guarantee response times or resolution of all issues. For support:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mt-4">
                        <li>Check our documentation and FAQ first</li>
                        <li>Report bugs and issues through our official channels</li>
                        <li>Do not share sensitive information like private keys in support communications</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">14. Governing Law and Disputes</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with applicable laws.
                        Any disputes arising from your use of Freelii shall be resolved through binding arbitration
                        or in courts of competent jurisdiction.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
                    <p>
                        If you have questions about these Terms of Service, please contact us through our official
                        communication channels. Do not contact us regarding fund recovery, transaction reversals,
                        or private key assistance, as we cannot provide such services.
                    </p>
                </section>

                <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-8 dark:bg-red-900/20 dark:border-red-500">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700 dark:text-red-300">
                                <strong>FINAL REMINDER:</strong> Freelii is experimental beta software. By using this service,
                                you acknowledge that you understand the risks and accept full responsibility for any outcomes.
                                If you are not comfortable with these risks, please do not use the service.
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="my-8" />

                <p className="text-xs text-gray-500 dark:text-gray-400">
                    By continuing to use Freelii, you acknowledge that you have read, understood, and agreed to these Terms of Service.
                </p>

                {/* Enhanced footer */}
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-4">
                            <span>© 2025 Freelii Tech, Inc.</span>
                            <div className="hidden sm:block w-px h-3 bg-gray-300"></div>
                            <span className="hidden sm:inline">All rights reserved.</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/" className="hover:text-blue-500 transition-colors">Back to Home</Link>
                            <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}