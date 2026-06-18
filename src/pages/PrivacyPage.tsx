/**
 * 隐私政策页面
 * 说明球胜算平台如何收集、使用、存储和保护用户个人信息
 */

import { LegalLayout, LegalSection } from '@/components/layout/LegalLayout';

const TOC = [
  { id: 'collection', title: '一、信息收集' },
  { id: 'use', title: '二、信息使用' },
  { id: 'storage', title: '三、信息存储与保护' },
  { id: 'sharing', title: '四、信息共享与披露' },
  { id: 'cookie', title: '五、Cookie 与本地存储' },
  { id: 'rights', title: '六、用户权利' },
  { id: 'minor', title: '七、未成年人保护' },
  { id: 'thirdparty', title: '八、第三方服务' },
  { id: 'update', title: '九、政策更新' },
  { id: 'contact', title: '十、联系方式' },
];

export default function PrivacyPage() {
  return (
    <LegalLayout title="隐私政策" lastUpdated="2026年6月18日" toc={TOC}>
      <LegalSection id="collection" title="一、信息收集">
        <p>
          我们在为您提供服务的过程中，可能会收集以下类型的个人信息：
        </p>
        <p><strong>1.1 您主动提供的信息</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>注册信息：</strong>手机号码、邮箱地址、昵称、密码（加密存储）</li>
          <li><strong>个人资料：</strong>头像图片</li>
          <li><strong>验证信息：</strong>手机/邮箱验证码</li>
          <li><strong>反馈信息：</strong>您通过客服或反馈渠道提交的内容</li>
        </ul>
        <p><strong>1.2 自动收集的信息</strong></p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>设备信息：</strong>设备型号、操作系统版本、浏览器类型</li>
          <li><strong>日志信息：</strong>访问时间、IP 地址、访问页面</li>
          <li><strong>使用数据：</strong>功能使用频率、搜索记录、浏览行为</li>
        </ul>
        <p><strong>1.3 敏感信息</strong></p>
        <p>
          我们采用 RSA + AES 混合加密技术保护您在传输过程中的敏感信息（如手机号、密码等），确保数据安全。
        </p>
      </LegalSection>

      <LegalSection id="use" title="二、信息使用">
        <p>我们收集的个人信息将用于以下目的：</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>提供服务：</strong>创建和管理您的账户，提供核心功能</li>
          <li><strong>身份验证：</strong>验证您的身份，保障账户安全</li>
          <li><strong>服务优化：</strong>分析使用数据，改进产品功能和用户体验</li>
          <li><strong>安全防护：</strong>防范欺诈、滥用等安全风险</li>
          <li><strong>合规义务：</strong>遵守法律法规要求</li>
          <li><strong>通知推送：</strong>向您发送服务变更、安全提醒等必要通知</li>
        </ul>
        <p>
          我们不会将您的个人信息用于上述目的之外的用途。如需将信息用于其他目的，会事先征得您的同意。
        </p>
      </LegalSection>

      <LegalSection id="storage" title="三、信息存储与保护">
        <p><strong>3.1 存储地点</strong></p>
        <p>
          您的个人信息存储在中华人民共和国境内的服务器上。如需跨境传输，我们会严格遵守相关法律法规。
        </p>
        <p><strong>3.2 存储期限</strong></p>
        <p>
          我们仅在实现服务目的所必需的期限内保留您的个人信息。账户注销后，我们会在合理期限内删除或匿名化处理您的个人信息（法律法规另有规定的除外）。
        </p>
        <p><strong>3.3 安全措施</strong></p>
        <p>我们采取以下措施保护您的个人信息安全：</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>传输加密：使用 RSA + AES 混合加密技术保护敏感数据传输</li>
          <li>存储加密：密码等敏感信息加密存储</li>
          <li>访问控制：严格的权限管理，限制对个人信息的访问</li>
          <li>安全审计：定期进行安全检查和漏洞修复</li>
          <li>配置加密：数据库等敏感配置使用 Jasypt 加密</li>
        </ul>
        <p><strong>3.4 安全事件处理</strong></p>
        <p>
          如发生个人信息安全事件，我们会立即启动应急预案，采取补救措施，并按照法律法规要求通知您。
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="四、信息共享与披露">
        <p>
          未经您的同意，我们不会向第三方共享您的个人信息，但以下情况除外：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>法律法规要求：</strong>根据法律、法规、法律程序或政府主管部门的强制性要求</li>
          <li><strong>安全需要：</strong>为维护本平台或公众的安全、合法权益</li>
          <li><strong>合并/收购：</strong>如发生合并、收购或资产出售，您的信息可能作为资产被转移（我们会继续保护您的信息）</li>
          <li><strong>授权同意：</strong>获得您的明确授权或同意</li>
        </ul>
        <p>
          我们不会将您的个人信息出售给任何第三方。
        </p>
      </LegalSection>

      <LegalSection id="cookie" title="五、Cookie 与本地存储">
        <p><strong>5.1 Cookie 使用</strong></p>
        <p>
          本平台使用 Cookie 和本地存储技术来：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>维持您的登录状态</li>
          <li>记住您的偏好设置</li>
          <li>保障服务安全</li>
          <li>分析服务使用情况</li>
        </ul>
        <p><strong>5.2 管理 Cookie</strong></p>
        <p>
          您可以通过浏览器设置管理或删除 Cookie。但请注意，禁用 Cookie 可能影响部分功能的正常使用。
        </p>
      </LegalSection>

      <LegalSection id="rights" title="六、用户权利">
        <p>您对您的个人信息享有以下权利：</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>访问权：</strong>查看我们持有的您的个人信息</li>
          <li><strong>更正权：</strong>更新或更正不准确的个人信息</li>
          <li><strong>删除权：</strong>要求删除您的个人信息</li>
          <li><strong>撤回同意：</strong>撤回您此前给予的同意</li>
          <li><strong>注销账户：</strong>申请注销您的账户</li>
        </ul>
        <p>
          如需行使上述权利，请通过本页面底部的联系方式与我们联系。我们会在合理期限内响应您的请求。
        </p>
      </LegalSection>

      <LegalSection id="minor" title="七、未成年人保护">
        <p>
          本平台不面向未满18周岁的未成年人提供服务。如果我们发现在未获得监护人同意的情况下收集了未成年人的个人信息，我们会尽快删除相关数据。
        </p>
        <p>
          如果您是未成年人的监护人，发现您的被监护人未经您同意向我们提供了个人信息，请通过本页面底部的联系方式与我们联系，我们会及时处理。
        </p>
      </LegalSection>

      <LegalSection id="thirdparty" title="八、第三方服务">
        <p>
          本平台可能包含第三方服务的链接或集成（如图形验证码服务、短信服务等）。这些第三方有其独立的隐私政策，我们建议您查阅其隐私政策。
        </p>
        <p>
          我们对第三方的隐私政策或实践不承担任何责任。
        </p>
      </LegalSection>

      <LegalSection id="update" title="九、政策更新">
        <p>
          我们可能会不时更新本隐私政策。更新后的政策将在本平台公布，公布即生效。对于重大变更，我们会通过平台通知或其他方式提醒您。
        </p>
        <p>
          建议您定期查阅本隐私政策，以了解最新内容。
        </p>
      </LegalSection>

      <LegalSection id="contact" title="十、联系方式">
        <p>
          如您对本隐私政策有任何疑问、意见或建议，或需要行使您的个人信息权利，请通过以下方式联系我们：
        </p>
        <p>
          邮箱：<span style={{ color: '#4A9EFF' }}>privacy@ballwin.cn</span>
        </p>
        <p>
          我们会在15个工作日内回复您的请求。
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
