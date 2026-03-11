import { Coffee, Heart, Github, Twitter, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function SponsorPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = async (address: string, label: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(label);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const cryptoAddresses = {
    eth: '0x2FbF8091585cB317b131CCF7116a5F5F8080eBa3',
    btc: 'bc1qlgx69s3t7e99f3yzaw26aqspewrkzvks5wluc9',
    sol: '2ezLjrXS6hjYmu3J85asQdEi6Zo6DB6EcsLneSHdrSvb',
    ton: 'TVS23vWDprEZHFoofzixHNFCid5sMaTX71',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Coffee className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold">请我喝杯咖啡 ☕</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          如果 OpenClaw Evolution Plugin 对你有帮助，欢迎请我喝一杯咖啡！
          你的支持是我持续开发的动力。
        </p>
      </div>

      {/* Crypto Addresses */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">💰 加密货币捐赠</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Ethereum */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">Ξ</span>
              </div>
              <div>
                <h3 className="font-semibold">Ethereum (ETH)</h3>
                <p className="text-xs text-muted-foreground">ERC-20 / USDT / USDC</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-3">
              <code className="text-sm break-all">{cryptoAddresses.eth}</code>
            </div>
            <button
              onClick={() => copyToClipboard(cryptoAddresses.eth, 'eth')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copiedAddress === 'eth' ? (
                <>
                  <Check className="h-4 w-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制地址
                </>
              )}
            </button>
          </div>

          {/* Bitcoin */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">₿</span>
              </div>
              <div>
                <h3 className="font-semibold">Bitcoin (BTC)</h3>
                <p className="text-xs text-muted-foreground">Native SegWit</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-3">
              <code className="text-sm break-all">{cryptoAddresses.btc}</code>
            </div>
            <button
              onClick={() => copyToClipboard(cryptoAddresses.btc, 'btc')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {copiedAddress === 'btc' ? (
                <>
                  <Check className="h-4 w-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制地址
                </>
              )}
            </button>
          </div>

          {/* Solana */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">◎</span>
              </div>
              <div>
                <h3 className="font-semibold">Solana (SOL)</h3>
                <p className="text-xs text-muted-foreground">SPL Tokens</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-3">
              <code className="text-sm break-all">{cryptoAddresses.sol}</code>
            </div>
            <button
              onClick={() => copyToClipboard(cryptoAddresses.sol, 'sol')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              {copiedAddress === 'sol' ? (
                <>
                  <Check className="h-4 w-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制地址
                </>
              )}
            </button>
          </div>

          {/* TON */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">💎</span>
              </div>
              <div>
                <h3 className="font-semibold">TON (TON)</h3>
                <p className="text-xs text-muted-foreground">Toncoin</p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-3">
              <code className="text-sm break-all">{cryptoAddresses.ton}</code>
            </div>
            <button
              onClick={() => copyToClipboard(cryptoAddresses.ton, 'ton')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              {copiedAddress === 'ton' ? (
                <>
                  <Check className="h-4 w-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  复制地址
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Support Options */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Buy Me a Coffee */}
        <div className="card p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-center">
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
              className="h-[60px] w-[217px]"
            />
          </div>
          <h3 className="font-semibold">Buy Me a Coffee</h3>
          <p className="text-sm text-muted-foreground">
            快速、简单的支持方式
          </p>
          <a
            href="https://www.buymeacoffee.com/openclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors font-medium"
          >
            请喝咖啡
          </a>
        </div>

        {/* WeChat Pay */}
        <div className="card p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Coffee className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="font-semibold">微信支付</h3>
          <p className="text-sm text-muted-foreground">
            扫码支持开发
          </p>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Coffee className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">二维码待添加</p>
            </div>
          </div>
        </div>

        {/* Alipay */}
        <div className="card p-6 text-center space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Coffee className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h3 className="font-semibold">支付宝</h3>
          <p className="text-sm text-muted-foreground">
            便捷的支付方式
          </p>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Coffee className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">二维码待添加</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Benefits */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          赞助者福利
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl mb-2">☕</div>
            <h3 className="font-semibold mb-1">咖啡</h3>
            <p className="text-sm text-muted-foreground">
              在致谢名单中列出你的名字
            </p>
          </div>

          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="text-2xl mb-2">🍰</div>
            <h3 className="font-semibold mb-1">蛋糕</h3>
            <p className="text-sm text-muted-foreground">
              在 README 中添加你的网站链接
            </p>
          </div>

          <div className="p-4 bg-primary/15 rounded-lg">
            <div className="text-2xl mb-2">🎂</div>
            <h3 className="font-semibold mb-1">蛋糕塔</h3>
            <p className="text-sm text-muted-foreground">
              成为项目的 Contributor
            </p>
          </div>

          <div className="p-4 bg-primary/20 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibold mb-1">特别赞助</h3>
            <p className="text-sm text-muted-foreground">
              在项目主页展示你的 Logo
            </p>
          </div>
        </div>
      </div>

      {/* Why Support */}
      <div className="card p-8 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <h2 className="text-2xl font-bold mb-4">为什么要支持？</h2>
        <div className="space-y-3 text-muted-foreground">
          <p>✨ **持续开发**: 支持新功能的开发和维护</p>
          <p>🐛 **Bug 修复**: 帮助快速修复问题</p>
          <p>📖 **文档完善**: 改进教程和文档质量</p>
          <p>🎨 **UI 优化**: 提升用户体验</p>
          <p>🔧 **开源贡献**: 支持开源社区发展</p>
        </div>
      </div>

      {/* Sponsors List */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold mb-6">💖 感谢赞助者</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p>成为第一个赞助者！</p>
          <p className="text-sm mt-2">你的支持将出现在这里</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">也可以通过以下方式支持</p>
        <div className="flex justify-center gap-4">
          <a
            href="https://github.com/openclaw-evolution/plugin"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href="https://twitter.com/openclaw_evolution"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          Star ⭐️ 项目，分享给更多人
        </p>
      </div>

      {/* Footer Message */}
      <div className="text-center py-8">
        <p className="text-lg font-medium mb-2">
          感谢你的支持！🙏
        </p>
        <p className="text-muted-foreground">
          每一杯咖啡都是对开源社区的一份贡献
        </p>
      </div>
    </div>
  );
}
