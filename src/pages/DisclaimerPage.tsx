/**
 * 免责声明页面
 * 说明球胜算平台的责任边界与使用限制
 */

import { LegalLayout, LegalSection } from '@/components/layout/LegalLayout';

const TOC = [
  { id: 'general', title: '一、总则' },
  { id: 'data', title: '二、数据准确性声明' },
  { id: 'betting', title: '三、非决策建议声明' },
  { id: 'thirdparty', title: '四、第三方链接与内容' },
  { id: 'availability', title: '五、服务可用性' },
  { id: 'security', title: '六、安全风险' },
  { id: 'limitation', title: '七、责任限制' },
  { id: 'indemnification', title: '八、用户赔偿' },
  { id: 'update', title: '九、声明更新' },
];

export default function DisclaimerPage() {
  return (
    <LegalLayout title="免责声明" lastUpdated="2026年6月18日" toc={TOC}>
      <LegalSection id="general" title="一、总则">
        <p>
          本免责声明适用于球胜算平台（以下简称"本平台"）的所有用户。使用本平台即表示您已阅读、理解并同意接受本声明的全部条款。
        </p>
        <p>
          本平台是一个足球赛事数据分析工具，旨在为用户提供赛事信息查询、赔率走势分析、历史数据对比等数据参考服务。本平台不提供任何形式的代购或信息服务。
        </p>
      </LegalSection>

      <LegalSection id="data" title="二、数据准确性声明">
        <p><strong>2.1 数据来源</strong></p>
        <p>
          本平台展示的赛事信息、赔率数据、历史记录等数据来源于公开渠道，本平台对这些数据进行整理、计算和可视化展示。
        </p>
        <p><strong>2.2 准确性保证</strong></p>
        <p>
          尽管本平台尽力确保数据的准确性和及时性，但不对以下情况作出任何保证：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>数据的完整性、准确性、可靠性或及时性</li>
          <li>赔率数据与实际盘口的一致性</li>
          <li>历史数据的绝对准确</li>
          <li>分析结果与实际情况的吻合程度</li>
        </ul>
        <p><strong>2.3 数据延迟</strong></p>
        <p>
          由于网络传输、数据处理等原因，本平台展示的数据可能存在延迟。赔率等实时数据的延迟可能导致显示值与实际值存在差异。
        </p>
        <p><strong>2.4 数据修正</strong></p>
        <p>
          本平台保留对已发布数据进行修正的权利，恕不另行通知。
        </p>
      </LegalSection>

      <LegalSection id="betting" title="三、非决策建议声明">
        <p>
          <strong>本平台提供的所有数据、分析、图表和工具不构成任何形式的决策建议、投资指导或盈利承诺。</strong>
        </p>
        <p>您应充分了解以下事项：</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>竞技体育赛事结果具有高度不确定性，任何分析都无法准确预测比赛结果</li>
          <li>过往数据和赔率走势不能代表未来表现</li>
          <li>任何基于本平台信息做出的投资决策，其风险和后果完全由您自行承担</li>
          <li>本平台不对用户的任何决策损失（包括但不限于本金损失、机会成本等）承担任何责任</li>
        </ul>
        <p>
          如果您选择参与任何形式的体育竞猜活动，请确保您已年满18周岁，并在法律允许的范围内理性参与。
        </p>
      </LegalSection>

      <LegalSection id="thirdparty" title="四、第三方链接与内容">
        <p>
          本平台可能包含指向第三方网站的链接，或展示第三方提供的内容。本平台对第三方内容的准确性、合法性、安全性不承担任何责任。
        </p>
        <p>
          您通过本平台访问第三方网站或使用第三方服务时，应自行评估风险并遵守第三方的使用条款。本平台不对因使用第三方内容或服务导致的任何损失承担责任。
        </p>
      </LegalSection>

      <LegalSection id="availability" title="五、服务可用性">
        <p>
          本平台不对服务的连续性、可用性作出保证。以下情况可能导致服务中断或不可用：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>系统维护、升级或故障</li>
          <li>网络连接问题</li>
          <li>不可抗力事件（自然灾害、战争、政府行为等）</li>
          <li>第三方服务中断（如数据源、云服务商等）</li>
          <li>安全事件或攻击</li>
        </ul>
        <p>
          对于因上述原因导致的服务中断、数据丢失或任何损失，本平台不承担责任。
        </p>
      </LegalSection>

      <LegalSection id="security" title="六、安全风险">
        <p>
          尽管本平台采取了合理的安全措施保护用户数据和系统安全，但无法保证系统绝对安全。您了解并同意：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>互联网传输存在固有风险，无法保证信息传输的绝对安全</li>
          <li>本平台可能因安全漏洞、黑客攻击等原因导致数据泄露或服务异常</li>
          <li>您应自行做好账户安全保护，包括设置强密码、定期更换密码等</li>
        </ul>
      </LegalSection>

      <LegalSection id="limitation" title="七、责任限制">
        <p>
          在法律允许的最大范围内，本平台及其关联方、员工、合作伙伴对以下情况不承担任何责任：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>任何直接、间接、偶然、特殊、惩罚性或后果性损害</li>
          <li>利润损失、数据丢失、业务中断</li>
          <li>因使用或无法使用本平台服务导致的任何损失</li>
          <li>因依赖本平台数据或分析结果做出决策导致的任何损失</li>
          <li>因第三方行为或疏忽导致的任何损失</li>
        </ul>
        <p>
          本平台的赔偿责任总额不超过用户在争议发生前12个月内向本平台支付的费用（如有）。如用户未支付任何费用，本平台不承担赔偿责任。
        </p>
      </LegalSection>

      <LegalSection id="indemnification" title="八、用户赔偿">
        <p>
          如因您的以下行为导致本平台或第三方遭受损失，您同意赔偿并使本平台免受损害：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>违反本声明或用户协议</li>
          <li>违反法律法规</li>
          <li>侵犯第三方权益</li>
          <li>滥用本平台服务</li>
        </ul>
      </LegalSection>

      <LegalSection id="update" title="九、声明更新">
        <p>
          本平台有权不时修改本免责声明。修改后的声明将在本平台公布，公布即生效。如您在声明修改后继续使用本平台，即视为您已接受修改后的声明。
        </p>
        <p>
          建议您定期查阅本免责声明，以了解最新内容。
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
