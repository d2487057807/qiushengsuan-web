/**
 * 用户协议页面
 * 定义用户使用球胜算服务的权利与义务
 */

import { LegalLayout, LegalSection } from '@/components/layout/LegalLayout';

const TOC = [
  { id: 'service', title: '一、服务说明' },
  { id: 'account', title: '二、用户账户' },
  { id: 'behavior', title: '三、用户行为规范' },
  { id: 'content', title: '四、内容与知识产权' },
  { id: 'privacy', title: '五、隐私保护' },
  { id: 'disclaimer', title: '六、免责声明' },
  { id: 'liability', title: '七、责任限制' },
  { id: 'modify', title: '八、协议修改' },
  { id: 'termination', title: '九、服务终止' },
  { id: 'law', title: '十、法律适用与争议解决' },
  { id: 'contact', title: '十一、联系方式' },
];

export default function TermsPage() {
  return (
    <LegalLayout title="用户协议" lastUpdated="2026年6月18日" toc={TOC}>
      <LegalSection id="service" title="一、服务说明">
        <p>
          欢迎使用球胜算（以下简称"本平台"）。本平台是一个足球赛事数据分析工具，为用户提供赛事信息查询、赔率走势分析、历史数据对比等数据参考服务。
        </p>
        <p>
          本平台提供的所有数据和分析结果仅供学习研究和参考之用，不构成任何形式的决策建议或投资指导。用户应自行判断并承担使用本平台信息的一切后果。
        </p>
        <p>
          在使用本平台服务前，请您仔细阅读并充分理解本协议的全部内容。如果您不同意本协议的任何条款，请停止使用本平台服务。您的注册、登录或使用行为即视为您已阅读并同意本协议。
        </p>
      </LegalSection>

      <LegalSection id="account" title="二、用户账户">
        <p><strong>2.1 注册条件</strong></p>
        <p>
          您确认在注册时已年满18周岁，具有完全民事行为能力。未满18周岁的未成年人不得使用本平台服务。
        </p>
        <p><strong>2.2 账户安全</strong></p>
        <p>
          您应妥善保管账户信息及密码，因您个人原因导致的账户安全问题（包括但不限于密码泄露、账户被盗用），由您自行承担责任。
        </p>
        <p><strong>2.3 账户使用</strong></p>
        <p>
          您的账户仅限您个人使用，不得将账户转让、赠与、借用或以其他方式提供给他人使用。如发现未经授权使用您的账户，应立即通知本平台。
        </p>
        <p><strong>2.4 注册信息</strong></p>
        <p>
          您在注册时应提供真实、准确、完整的个人信息。如信息发生变更，应及时更新。因提供虚假信息或未及时更新信息导致的后果由您自行承担。
        </p>
      </LegalSection>

      <LegalSection id="behavior" title="三、用户行为规范">
        <p>您在使用本平台时，应遵守以下规范：</p>
        <p><strong>3.1 禁止行为</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li>利用本平台从事任何违反法律法规的活动</li>
          <li>对本平台进行反向工程、反编译或反汇编</li>
          <li>使用自动化工具（爬虫、脚本等）批量获取本平台数据</li>
          <li>干扰或破坏本平台的正常运行</li>
          <li>发布虚假、误导性或有害信息</li>
          <li>侵犯他人的合法权益</li>
          <li>将本平台数据用于商业用途（未经授权）</li>
        </ul>
        <p><strong>3.2 违规处理</strong></p>
        <p>
          如您违反上述规范，本平台有权采取警告、暂停服务、永久封禁账户等措施，并保留追究法律责任的权利。
        </p>
      </LegalSection>

      <LegalSection id="content" title="四、内容与知识产权">
        <p><strong>4.1 平台内容</strong></p>
        <p>
          本平台的页面设计、文字、图片、图表、软件、代码等所有内容（除赛事数据外），其知识产权归本平台所有。未经书面授权，任何人不得复制、修改、传播或使用上述内容。
        </p>
        <p><strong>4.2 赛事数据</strong></p>
        <p>
          本平台展示的赛事信息、赔率数据等来源于公开渠道，本平台对其进行整理、分析和展示。用户使用这些数据应遵守相关法律法规。
        </p>
        <p><strong>4.3 用户内容</strong></p>
        <p>
          用户在本平台发布的任何内容（如评论、反馈等），授予本平台在全球范围内的免费、非独占、可再许可的使用权。
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="五、隐私保护">
        <p>
          本平台重视用户隐私保护。关于用户个人信息的收集、使用、存储和保护，请参阅我们的
          <a href="/qiushengsuan/privacy" style={{ color: '#4A9EFF', textDecoration: 'none' }}>《隐私政策》</a>。
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="六、免责声明">
        <p><strong>6.1 数据准确性</strong></p>
        <p>
          本平台尽力确保数据的准确性和及时性，但不对数据的完整性、准确性、可靠性作出任何明示或暗示的保证。赛事数据可能存在延迟、错误或遗漏。
        </p>
        <p><strong>6.2 决策风险</strong></p>
        <p>
          本平台提供的所有分析和数据不构成决策建议。任何基于本平台信息做出的投资决策，其风险和后果由用户自行承担。本平台不对用户的任何决策损失承担责任。
        </p>
        <p><strong>6.3 服务中断</strong></p>
        <p>
          本平台可能因系统维护、升级、故障或不可抗力等原因暂停或中断服务。对于因此导致的任何损失，本平台不承担责任。
        </p>
        <p><strong>6.4 第三方内容</strong></p>
        <p>
          本平台可能包含第三方网站的链接或内容，本平台不对第三方内容的准确性或合法性负责。
        </p>
      </LegalSection>

      <LegalSection id="liability" title="七、责任限制">
        <p>
          在法律允许的最大范围内，本平台对以下情况不承担任何责任：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>因用户使用或无法使用本平台服务导致的任何直接、间接、偶然、特殊或后果性损害</li>
          <li>因数据错误、延迟或遗漏导致的任何损失</li>
          <li>因第三方行为导致的任何损失</li>
          <li>因不可抗力导致的任何损失</li>
        </ul>
        <p>
          本平台的赔偿责任总额不超过用户在争议发生前12个月内向本平台支付的费用（如有）。
        </p>
      </LegalSection>

      <LegalSection id="modify" title="八、协议修改">
        <p>
          本平台有权根据需要不时修改本协议。修改后的协议将在本平台公布，公布即生效。如您在协议修改后继续使用本平台服务，即视为您已接受修改后的协议。如您不同意修改内容，应停止使用本平台服务。
        </p>
      </LegalSection>

      <LegalSection id="termination" title="九、服务终止">
        <p><strong>9.1 用户终止</strong></p>
        <p>
          您可以随时通过注销账户或停止使用本平台服务来终止本协议。
        </p>
        <p><strong>9.2 平台终止</strong></p>
        <p>
          本平台有权在以下情况下终止对您的服务：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>您违反本协议的任何条款</li>
          <li>法律法规要求</li>
          <li>本平台决定停止提供服务</li>
        </ul>
        <p><strong>9.3 终止后果</strong></p>
        <p>
          协议终止后，本平台有权保留或删除您的账户信息和使用数据。本协议中关于知识产权、免责声明、责任限制等条款在终止后继续有效。
        </p>
      </LegalSection>

      <LegalSection id="law" title="十、法律适用与争议解决">
        <p>
          本协议的签订、履行和解释均适用中华人民共和国法律。因本协议引起的或与本协议有关的任何争议，双方应友好协商解决；协商不成的，任何一方均有权向本平台所在地有管辖权的人民法院提起诉讼。
        </p>
      </LegalSection>

      <LegalSection id="contact" title="十一、联系方式">
        <p>
          如您对本协议有任何疑问、意见或建议，请通过以下方式联系我们：
        </p>
        <p>
          邮箱：<span style={{ color: '#4A9EFF' }}>support@ballwin.cn</span>
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
