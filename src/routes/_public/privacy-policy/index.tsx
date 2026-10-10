import { createFileRoute } from '@tanstack/react-router';
import { AlignLeft, Languages, Mail, ScanFace, Shield } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ItemTitle } from '@/components/ui/item';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_public/privacy-policy/')({
  component: PrivacyPolicyPage,
});

type Locale = 'en' | 'pt';

// Ingles e o padrao: esta pagina e o documento que a App Review da Apple consulta,
// e o revisor precisa conseguir ler a secao de dados faciais sem tradutor.
const DEFAULT_LOCALE: Locale = 'en';

type Localized<T> = Record<Locale, T>;

const chrome: Localized<{
  title: string;
  subtitle: string;
  dates: string;
  onThisPage: string;
  switchLabel: string;
  deletionHeading: string;
  deletionToc: string;
  cta: string;
}> = {
  en: {
    title: 'Privacy Policy',
    subtitle: 'Your privacy matters to us. Learn how we handle your personal data.',
    dates: 'Effective as of October 30, 2023 · Last updated on October 10, 2026',
    onThisPage: 'On this page',
    switchLabel: 'Ver em português',
    deletionHeading: 'Data Deletion',
    deletionToc: 'Data Deletion',
    cta: 'Request Deletion',
  },
  pt: {
    title: 'Política de Privacidade',
    subtitle: 'A sua privacidade é importante para nós. Conheça como tratamos seus dados pessoais.',
    dates: 'Efetiva a partir de 30 de outubro de 2023 · Última atualização em 10 de outubro de 2026',
    onThisPage: 'Nesta página',
    switchLabel: 'View in English',
    deletionHeading: 'Exclusão de Dados',
    deletionToc: 'Exclusão de Dados',
    cta: 'Solicitar Exclusão',
  },
};

const DELETION_EMAIL = 'gesec@gesec.com.br';

type Section = {
  id: string;
  toc: Localized<string>;
  heading: Localized<string>;
  body: Localized<ReactNode>;
};

const sections: Section[] = [
  {
    id: 'section-privacy',
    toc: { en: 'Privacy and Collection', pt: 'Privacidade e Coleta' },
    heading: { en: 'Privacy and Information Collection', pt: 'Privacidade e Coleta de Informações' },
    body: {
      en: (
        <>
          <p>
            Your privacy matters to us. It is Gesec&rsquo;s policy to respect your privacy regarding any information we may collect through the Gesec app, the Gesec site and other
            sites we own and operate. The app is an access-management tool for condominiums, buildings and other controlled venues: it registers residents, dependents, visitors and
            service providers so that they can be identified by the venue&rsquo;s physical access-control equipment.
          </p>
          <p>
            <strong>The app contains no advertising</strong>, uses no advertising or tracking SDKs, and does not sell or share personal data for advertising or marketing purposes.
          </p>
          <p>
            We only request personal information when we genuinely need it to provide you with a service. We do so by fair and lawful means, with your knowledge and consent. We
            also tell you why we are collecting it and how it will be used.
          </p>
        </>
      ),
      pt: (
        <>
          <p>
            A sua privacidade é importante para nós. É política da Gesec respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar pelo aplicativo
            Gesec, pelo site Gesec e por outros sites que possuímos e operamos. O aplicativo é uma ferramenta de gestão de acesso para condomínios, edifícios e outros locais
            controlados: ele cadastra moradores, dependentes, visitantes e prestadores de serviço para que sejam identificados pelos equipamentos físicos de controle de acesso do
            local.
          </p>
          <p>
            <strong>O aplicativo não contém publicidade</strong>, não utiliza SDKs de publicidade ou rastreamento e não vende nem compartilha dados pessoais para fins de
            publicidade ou marketing.
          </p>
          <p>
            Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e
            consentimento. Também informamos por que estamos coletando e como será usado.
          </p>
        </>
      ),
    },
  },
  {
    id: 'section-face-data',
    toc: { en: 'Face Data', pt: 'Dados Faciais (Face Data)' },
    heading: { en: 'Face Data', pt: 'Dados Faciais (Face Data)' },
    body: {
      en: (
        <>
          <p>
            The app captures a photograph of your face for a single purpose: to identify you at the physical access-control equipment (turnstiles, face readers and entrance gates)
            of the venue you are authorized to enter. We do not use this image for any other purpose, we do not sell it, and we do not share it with third parties for advertising,
            marketing, analytics or the training of artificial intelligence models.
          </p>

          <h3>1. What face data is collected</h3>
          <ul>
            <li>
              <strong>A two-dimensional (2D) photograph of your face</strong>, captured with the device camera or selected by you from the photo library. The image is stored as a
              compressed JPEG, at most 1024 pixels on its longest side. It is the only face data that leaves your device.
            </li>
            <li>
              <strong>A framing check, processed only on your device.</strong> While the capture screen is open, the app identifies the approximate position of the face in the
              image (a bounding box) and measures the lighting level, solely to display on-screen guidance such as &ldquo;center your face&rdquo; or &ldquo;low light&rdquo;. These
              values exist only in the app&rsquo;s volatile memory, <strong>are never written to disk nor transmitted over the network</strong>, and are discarded as soon as the
              capture screen is closed.
            </li>
          </ul>
          <p>
            <strong>We do not collect</strong> three-dimensional facial mesh or mapping, depth maps, facial geometry, landmark measurements, facial expressions, estimates of
            emotion, age, gender or ethnicity, nor biometric templates generated on the device. The app{' '}
            <strong>does not use ARKit, the TrueDepth camera sensor, Apple&rsquo;s Face ID</strong> or any Apple face-recognition or face-tracking framework.
          </p>

          <h3>2. How face data is used</h3>
          <p>The facial photograph is used exclusively for identification in physical access control, specifically to:</p>
          <ul>
            <li>form part of your access record with the organization that administers the venue;</li>
            <li>
              be sent to the access-control equipment installed at the venue, which compares the registered image with the image captured as you pass through, in order to grant or
              deny entry;
            </li>
            <li>allow the person responsible for venue security to visually confirm your identity in an access log.</li>
          </ul>
          <p>
            The photograph is <strong>not</strong> used for filters, avatars, visual effects, advertising, behavioral profiling, emotion or demographic analysis, nor to train
            artificial intelligence or machine learning models.
          </p>
          <p>
            The app <strong>does not use face data for authentication</strong>: signing in to the app is done with your credentials, never with your face, and the app itself
            performs no facial comparison or recognition. Face data is <strong>not used to build user profiles</strong>, to track you, or to identify anonymous persons, and it is
            not combined with other data for any purpose other than the access-control function described above.
          </p>

          <h3>3. Where face data is stored</h3>
          <ul>
            <li>
              In our object storage service, transmitted over encrypted channels (HTTPS/TLS), with access restricted by credentials and by logical segregation between client
              organizations. Our database stores only the reference to the file, associated with your record &mdash; never the image itself.
            </li>
            <li>
              On the access-control equipment physically installed at the venue, within the network of the organization that administers that venue, because the equipment needs the
              image locally to perform validation at the moment of entry.
            </li>
          </ul>

          <h3>4. Sharing with third parties</h3>
          <p>
            <strong>We do not sell, rent, assign, license or disclose face data.</strong> No face data is shared with advertisers, data brokers, social networks, analytics tools or
            any third party for that third party&rsquo;s own purposes. The facial photograph is transmitted only to:
          </p>
          <ul>
            <li>
              <strong>the organization that administers the access venue</strong> (condominium, building, educational institution or company), which is the controller of your data
              and from whom you requested entry authorization;
            </li>
            <li>
              <strong>the access-control equipment of that same venue</strong>, which requires the image to perform entry validation;
            </li>
            <li>
              <strong>the cloud storage infrastructure provider</strong> that hosts our servers, strictly as a processor, contractually barred from accessing, using or disclosing
              the data for any purpose of its own.
            </li>
          </ul>
          <p>
            <strong>
              Any third party with whom we share face data is contractually required to provide the same or equal protection of that face data as stated in this Privacy Policy.
            </strong>{' '}
            This applies to the organization administering the access venue, to that venue&rsquo;s access-control equipment, and to the cloud storage provider. None of them is
            authorized to use, retain, disclose or process face data for any purpose other than access-control identification, nor for longer than the period set out in section 5,
            and all of them must apply the same security measures, the same retention limits and the same deletion rules established here.
          </p>
          <p>Disclosure to public authorities occurs only under a court order or an express legal obligation.</p>

          <h3>5. How long face data is retained</h3>
          <ul>
            <li>The photograph is kept for as long as your relationship with the venue or your access authorization remains active.</li>
            <li>
              Once the relationship ends &mdash; through termination, departure, cancellation of the record or expiry of a visitor authorization &mdash; or once you request
              deletion, the image is <strong>erased within 5 (five) calendar days</strong>, from both our storage servers and the access-control equipment.
            </li>
            <li>If you replace your photograph with another, the previous image is deleted from storage immediately upon replacement.</li>
            <li>Deletion covers both the stored image file and the corresponding reference in our database.</li>
          </ul>

          <h3>6. Consent, refusal and your rights</h3>
          <ul>
            <li>
              Capture occurs only after you expressly authorize camera access through the device operating system and confirm submission of the photograph. No image is captured in
              the background or without your direct action.
            </li>
            <li>
              You may refuse to provide the photograph. In that case, identification by facial recognition will not be available, and the organization responsible for the venue may
              offer alternative means of access.
            </li>
            <li>
              You may withdraw your consent and delete your face data at any time, free of charge:
              <ul>
                <li>
                  <strong>In the app:</strong> open <em>My Registration</em> (&ldquo;Meu Cadastro&rdquo;), tap the trash icon and confirm &ldquo;Delete account&rdquo;
                  (&ldquo;Excluir conta&rdquo;). This permanently deletes your account, your facial photograph and all associated data from our database and storage, and removes
                  your record from the venue&rsquo;s access-control equipment.
                </li>
                <li>
                  <strong>By e-mail</strong>, if you want to delete only the facial photograph and keep your account: write to{' '}
                  <a href={`mailto:${DELETION_EMAIL}?subject=${encodeURIComponent('Face Data Deletion Request')}`}>{DELETION_EMAIL}</a>.
                </li>
              </ul>
              Once consent is withdrawn, we and every party listed in section 4 promptly stop all use of your face data.
            </li>
            <li>For minors, the photograph is only collected with the consent of at least one parent or legal guardian.</li>
          </ul>
          <p>
            The processing of face data, as sensitive biometric personal data, complies with the Brazilian General Data Protection Law (Lei nº 13.709/2018), on the legal basis of
            the specific and highlighted consent of the data subject, under article 11, item I.
          </p>
        </>
      ),
      pt: (
        <>
          <p>
            O aplicativo captura uma fotografia do seu rosto com uma finalidade única: identificar você nos equipamentos de controle de acesso físico (catracas, leitoras faciais e
            portarias) do local em que você está autorizado a entrar. Não utilizamos essa imagem para nenhuma outra finalidade, não a vendemos e não a compartilhamos com terceiros
            para publicidade, marketing, analytics ou treinamento de modelos de inteligência artificial.
          </p>

          <h3>1. Quais dados faciais são coletados</h3>
          <ul>
            <li>
              <strong>Fotografia bidimensional (2D) do rosto</strong>, capturada pela câmera do dispositivo ou selecionada por você na galeria de fotos. A imagem é gravada em
              formato JPEG comprimido, com no máximo 1024 pixels de lado. É o único dado facial que sai do seu dispositivo.
            </li>
            <li>
              <strong>Verificação de enquadramento, processada apenas no seu dispositivo.</strong> Enquanto a tela de captura está aberta, o aplicativo identifica a posição
              aproximada do rosto na imagem (um retângulo delimitador) e mede o nível de iluminação, exclusivamente para exibir orientações na tela, como &ldquo;centralize a
              face&rdquo; ou &ldquo;iluminação baixa&rdquo;. Esses valores existem somente na memória volátil do aplicativo,{' '}
              <strong>nunca são gravados em disco nem transmitidos pela rede</strong>, e são descartados assim que a tela de captura é fechada.
            </li>
          </ul>
          <p>
            <strong>Não coletamos</strong> malha ou mapeamento facial tridimensional, mapa de profundidade, geometria facial, medidas de pontos de referência (landmarks),
            expressões faciais, estimativas de emoção, idade, gênero ou etnia, nem templates biométricos gerados no dispositivo. O aplicativo{' '}
            <strong>não utiliza ARKit, o sensor de câmera TrueDepth, o Face ID da Apple</strong> nem qualquer framework de reconhecimento ou rastreamento facial da Apple.
          </p>

          <h3>2. Como os dados faciais são utilizados</h3>
          <p>A fotografia do rosto é usada exclusivamente para identificação em controle de acesso físico, especificamente para:</p>
          <ul>
            <li>compor o seu cadastro de acesso junto à organização que administra o local;</li>
            <li>
              ser enviada aos equipamentos de controle de acesso instalados no local, que comparam a imagem cadastrada com a imagem captada no momento da sua passagem, a fim de
              liberar ou negar a entrada;
            </li>
            <li>permitir que o responsável pela segurança do local confirme visualmente a sua identidade em um registro de acesso.</li>
          </ul>
          <p>
            A fotografia <strong>não</strong> é utilizada para filtros, avatares, efeitos visuais, publicidade, perfilamento comportamental, análise de emoções ou características
            demográficas, nem para treinar modelos de inteligência artificial ou aprendizado de máquina.
          </p>
          <p>
            O aplicativo <strong>não utiliza dados faciais para autenticação</strong>: o login no aplicativo é feito com suas credenciais, nunca com o seu rosto, e o próprio
            aplicativo não realiza nenhuma comparação ou reconhecimento facial. Os dados faciais <strong>não são usados para construir perfis de usuário</strong>, para rastrear
            você ou para identificar pessoas anônimas, e não são combinados com outros dados para nenhuma finalidade além da função de controle de acesso descrita acima.
          </p>

          <h3>3. Onde os dados faciais são armazenados</h3>
          <ul>
            <li>
              Em nosso serviço de armazenamento de objetos, com transmissão criptografada (HTTPS/TLS) e acesso restrito por credenciais e por segregação lógica entre organizações
              clientes. O nosso banco de dados guarda apenas a referência ao arquivo, associada ao seu cadastro — nunca a imagem em si.
            </li>
            <li>
              Nos próprios equipamentos de controle de acesso instalados fisicamente no local, dentro da rede da organização que administra aquele local, porque o equipamento
              precisa da imagem localmente para realizar a validação no momento da passagem.
            </li>
          </ul>

          <h3>4. Compartilhamento com terceiros</h3>
          <p>
            <strong>Não vendemos, alugamos, cedemos, licenciamos nem divulgamos dados faciais.</strong> Nenhum dado facial é compartilhado com anunciantes, corretores de dados,
            redes sociais, ferramentas de analytics ou qualquer terceiro para finalidade própria desse terceiro. A fotografia do rosto é transmitida somente para:
          </p>
          <ul>
            <li>
              <strong>a organização que administra o local de acesso</strong> (condomínio, edifício, instituição de ensino ou empresa), que é a controladora dos seus dados e a quem
              você solicitou autorização de entrada;
            </li>
            <li>
              <strong>os equipamentos de controle de acesso desse mesmo local</strong>, que necessitam da imagem para executar a validação de entrada;
            </li>
            <li>
              <strong>o provedor de infraestrutura de armazenamento em nuvem</strong> que hospeda nossos servidores, na estrita condição de operador, contratualmente impedido de
              acessar, utilizar ou divulgar os dados para qualquer finalidade própria.
            </li>
          </ul>
          <p>
            <strong>
              Todo terceiro com quem compartilhamos dados faciais está obrigado, por contrato, a conferir a esses dados proteção igual ou equivalente à descrita nesta Política de
              Privacidade.
            </strong>{' '}
            Isso vale para a organização que administra o local de acesso, para os equipamentos de controle de acesso desse local e para o provedor de armazenamento em nuvem.
            Nenhum deles está autorizado a utilizar, reter, divulgar ou tratar os dados faciais para finalidade diversa da identificação no controle de acesso, nem por prazo
            superior ao previsto na seção 5, e todos devem aplicar as mesmas medidas de segurança, os mesmos limites de retenção e as mesmas regras de exclusão aqui estabelecidas.
          </p>
          <p>Divulgação a autoridades públicas ocorre apenas mediante ordem judicial ou obrigação legal expressa.</p>

          <h3>5. Por quanto tempo os dados faciais são retidos</h3>
          <ul>
            <li>A fotografia é mantida enquanto durar o seu vínculo ou a sua autorização de acesso ao local.</li>
            <li>
              Encerrado o vínculo — por desligamento, saída, cancelamento do cadastro ou expiração da autorização de visita — ou solicitada a exclusão por você, a imagem é
              <strong> eliminada em até 5 (cinco) dias corridos</strong>, tanto dos nossos servidores de armazenamento quanto dos equipamentos de controle de acesso.
            </li>
            <li>Caso você substitua a sua fotografia por outra, a imagem anterior é apagada imediatamente do armazenamento no momento da substituição.</li>
            <li>A exclusão abrange o arquivo de imagem armazenado e a referência correspondente no nosso banco de dados.</li>
          </ul>

          <h3>6. Consentimento, recusa e seus direitos</h3>
          <ul>
            <li>
              A captura só ocorre depois que você autoriza expressamente o acesso à câmera pelo sistema operacional do dispositivo e confirma o envio da fotografia. Nenhuma imagem
              é capturada em segundo plano ou sem a sua ação direta.
            </li>
            <li>
              Você pode recusar o fornecimento da fotografia. Nesse caso, a identificação por reconhecimento facial não estará disponível, e a organização responsável pelo local
              poderá oferecer meios alternativos de acesso.
            </li>
            <li>
              Você pode revogar o consentimento e excluir os seus dados faciais a qualquer momento, sem custo:
              <ul>
                <li>
                  <strong>No aplicativo:</strong> abra <em>Meu Cadastro</em>, toque no ícone de lixeira e confirme &ldquo;Excluir conta&rdquo;. Isso exclui permanentemente a sua
                  conta, a sua fotografia facial e todos os dados associados do nosso banco de dados e armazenamento, e remove o seu cadastro dos equipamentos de controle de acesso
                  do local.
                </li>
                <li>
                  <strong>Por e-mail</strong>, se quiser excluir apenas a fotografia facial e manter a conta: escreva para{' '}
                  <a href={`mailto:${DELETION_EMAIL}?subject=${encodeURIComponent('Solicitação de Exclusão de Dados Faciais')}`}>{DELETION_EMAIL}</a>.
                </li>
              </ul>
              Revogado o consentimento, nós e todas as partes listadas na seção 4 cessamos prontamente qualquer uso dos seus dados faciais.
            </li>
            <li>No caso de menores de idade, a fotografia só é coletada mediante consentimento de pelo menos um dos pais ou do responsável legal.</li>
          </ul>
          <p>
            O tratamento de dados faciais, na qualidade de dado pessoal sensível biométrico, observa a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018), tendo como base
            legal o consentimento específico e destacado do titular, nos termos do artigo 11, inciso I.
          </p>
        </>
      ),
    },
  },
  {
    id: 'section-data',
    toc: { en: 'Retention and Sharing', pt: 'Retenção e Compartilhamento' },
    heading: { en: 'Retention and Sharing', pt: 'Retenção e Compartilhamento' },
    body: {
      en: (
        <>
          <p>
            We retain the information we collect only for as long as necessary to provide the requested service. When we store data, we protect it within commercially acceptable
            means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
          </p>
          <p>
            We do not share personally identifiable information publicly. Your registration data is shared only with the organization that administers the venue you access, with
            that venue&rsquo;s access-control equipment and with the infrastructure providers that host our servers, under the same conditions and protections described for face
            data in the &ldquo;Face Data&rdquo; section, or when required by law.
          </p>
          <p>
            If a security incident compromises personal data collected through the app, we will notify the affected users and the competent authorities, as required by applicable
            law, including by e-mail to the address registered in your account.
          </p>
          <p>
            Our site may contain links to external sites that we do not operate. Please be aware that we have no control over the content and practices of those sites and cannot
            accept responsibility for their respective privacy policies.
          </p>
        </>
      ),
      pt: (
        <>
          <p>
            Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente
            aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
          </p>
          <p>
            Não divulgamos informações de identificação pessoal publicamente. Os seus dados cadastrais são compartilhados apenas com a organização que administra o local que você
            acessa, com os equipamentos de controle de acesso desse local e com os provedores de infraestrutura que hospedam nossos servidores, nas mesmas condições e com as mesmas
            proteções descritas para dados faciais na seção &ldquo;Dados Faciais&rdquo;, ou quando exigido por lei.
          </p>
          <p>
            Caso um incidente de segurança comprometa dados pessoais coletados pelo aplicativo, notificaremos os usuários afetados e as autoridades competentes, conforme exigido
            pela legislação aplicável, inclusive por e-mail para o endereço cadastrado na sua conta.
          </p>
          <p>
            O nosso site pode ter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não
            podemos aceitar responsabilidade por suas respectivas políticas de privacidade.
          </p>
        </>
      ),
    },
  },
  {
    id: 'section-rights',
    toc: { en: 'Your Rights', pt: 'Seus Direitos' },
    heading: { en: 'Your Rights', pt: 'Seus Direitos' },
    body: {
      en: (
        <>
          <p>You are free to refuse our request for personal information, with the understanding that we may not be able to provide some of the services you want.</p>
          <p>
            Face data is only collected with your explicit consent, given at the moment of capture, as described in the &ldquo;Face Data&rdquo; section; it is never inferred from
            continued use of the app or site. You may delete your account and all associated data at any time in the app, under <em>My Registration</em> (&ldquo;Meu
            Cadastro&rdquo;). If you have any question about how we handle user data and personal information, contact us at{' '}
            <a href={`mailto:${DELETION_EMAIL}`}>{DELETION_EMAIL}</a>.
          </p>
        </>
      ),
      pt: (
        <>
          <p>Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.</p>
          <p>
            Dados faciais só são coletados com o seu consentimento explícito, dado no momento da captura, conforme descrito na seção &ldquo;Dados Faciais&rdquo;; esse consentimento
            nunca é presumido pelo uso continuado do aplicativo ou do site. Você pode excluir a sua conta e todos os dados associados a qualquer momento pelo aplicativo, em{' '}
            <em>Meu Cadastro</em>. Se tiver alguma dúvida sobre como lidamos com dados do usuário e informações pessoais, entre em contato pelo e-mail{' '}
            <a href={`mailto:${DELETION_EMAIL}`}>{DELETION_EMAIL}</a>.
          </p>
        </>
      ),
    },
  },
  {
    id: 'section-commitment',
    toc: { en: 'User Commitment', pt: 'Compromisso do Usuário' },
    heading: { en: 'User Commitment', pt: 'Compromisso do Usuário' },
    body: {
      en: (
        <>
          <p>The user undertakes to make appropriate use of the content and information that Gesec offers:</p>
          <ul>
            <li>Not to engage in activities that are illegal or contrary to good faith and public order;</li>
            <li>Not to distribute propaganda or content of a racist or xenophobic nature, illegal pornography, apologia for terrorism, or material against human rights;</li>
            <li>
              Not to cause damage to the physical and logical systems of Gesec, its suppliers or third parties, nor to introduce or spread computer viruses or any other systems
              capable of causing damage.
            </li>
          </ul>
        </>
      ),
      pt: (
        <>
          <p>O usuário se compromete a fazer uso adequado dos conteúdos e da informação que a Gesec oferece:</p>
          <ul>
            <li>Não se envolver em atividades ilegais ou contrárias à boa fé e à ordem pública;</li>
            <li>Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, pornografia ilegal, apologia ao terrorismo ou contra os direitos humanos;</li>
            <li>
              Não causar danos aos sistemas físicos e lógicos do Gesec, de seus fornecedores ou terceiros, para introduzir ou disseminar vírus informáticos ou quaisquer outros
              sistemas capazes de causar danos.
            </li>
          </ul>
        </>
      ),
    },
  },
  {
    id: 'section-terms',
    toc: { en: 'Terms of Service', pt: 'Termos de Serviço' },
    heading: { en: 'Terms of Service', pt: 'Termos de Serviço' },
    body: {
      en: (
        <>
          <p>
            By accessing the Gesec site, you agree to comply with these terms of service and all applicable laws and regulations, and you agree that you are responsible for
            compliance with all applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
          <p>
            Permission is granted to temporarily download one copy of the materials on the Gesec site, for personal, non-commercial transitory viewing only. This is the grant of a
            license, not a transfer of title. Under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose or for public display;</li>
            <li>Attempt to decompile or reverse engineer any software;</li>
            <li>Remove any copyright or other proprietary notations;</li>
            <li>Transfer the materials to another person or mirror them on any other server.</li>
          </ul>
        </>
      ),
      pt: (
        <>
          <p>
            Ao acessar ao site Gesec, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as
            leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site.
          </p>
          <p>
            É concedida permissão para baixar temporariamente uma cópia dos materiais no site Gesec, apenas para visualização transitória pessoal e não comercial. Esta é a
            concessão de uma licença, não uma transferência de título. Sob esta licença, você não pode:
          </p>
          <ul>
            <li>Modificar ou copiar os materiais;</li>
            <li>Usar os materiais para qualquer finalidade comercial ou para exibição pública;</li>
            <li>Tentar descompilar ou fazer engenharia reversa de qualquer software;</li>
            <li>Remover quaisquer direitos autorais ou outras notações de propriedade;</li>
            <li>Transferir os materiais para outra pessoa ou espelhar em qualquer outro servidor.</li>
          </ul>
        </>
      ),
    },
  },
  {
    id: 'section-legal',
    toc: { en: 'Limitations and Law', pt: 'Limitações e Lei' },
    heading: { en: 'Limitations and Governing Law', pt: 'Limitações e Lei Aplicável' },
    body: {
      en: (
        <>
          <p>
            The materials on the Gesec site are provided &ldquo;as is&rdquo;. Gesec makes no warranties, expressed or implied, and hereby disclaims and negates all other
            warranties, including implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
          </p>
          <p>
            In no event shall Gesec or its suppliers be liable for any damages arising out of the use or inability to use the materials on Gesec, even if notified of the
            possibility of such damages.
          </p>
          <p>
            Gesec may revise these terms of service at any time without notice. These terms are governed by and construed in accordance with the laws applicable to Gesec, and you
            irrevocably submit to the exclusive jurisdiction of the courts in that state or locality.
          </p>
        </>
      ),
      pt: (
        <>
          <p>
            Os materiais no site da Gesec são fornecidos &ldquo;como estão&rdquo;. Gesec não oferece garantias, expressas ou implícitas, e por este meio isenta e nega todas as
            outras garantias, incluindo garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual.
          </p>
          <p>
            Em nenhum caso a Gesec ou seus fornecedores serão responsáveis por quaisquer danos decorrentes do uso ou da incapacidade de usar os materiais em Gesec, mesmo que tenha
            sido notificado da possibilidade de tais danos.
          </p>
          <p>
            A Gesec pode revisar estes termos de serviço a qualquer momento, sem aviso prévio. Estes termos são regidos e interpretados de acordo com as leis da Gesec e você se
            submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
          </p>
        </>
      ),
    },
  },
];

const deletionCards: {
  icon: ComponentType<{ className?: string }>;
  title: Localized<string>;
  description: Localized<string>;
  subject: Localized<string>;
}[] = [
  {
    icon: ScanFace,
    title: { en: 'Request Face Data Deletion', pt: 'Solicitar Exclusão de Dados Faciais' },
    description: {
      en: 'Withdraw your consent and request deletion of your facial photograph from our servers and from the access-control equipment, within 5 calendar days.',
      pt: 'Revogue o consentimento e solicite a exclusão da sua fotografia facial dos nossos servidores e dos equipamentos de controle de acesso, em até 5 dias corridos.',
    },
    subject: { en: 'Face Data Deletion Request', pt: 'Solicitação de Exclusão de Dados Faciais' },
  },
  {
    icon: Shield,
    title: { en: 'Request Account Deletion', pt: 'Solicitar Exclusão de Conta' },
    description: {
      en: 'Permanently delete your account, facial photograph and all associated data. You can also do this directly in the app, under My Registration (Meu Cadastro) > trash icon.',
      pt: 'Exclua permanentemente sua conta, sua fotografia facial e todos os dados associados. Você também pode fazer isso direto no aplicativo, em Meu Cadastro > ícone de lixeira.',
    },
    subject: { en: 'Account Deletion Request', pt: 'Solicitação de Exclusão de Conta' },
  },
  {
    icon: Shield,
    title: { en: 'Request Data Deletion', pt: 'Solicitar Exclusão de Dados' },
    description: {
      en: 'Request deletion of your data while keeping your account active.',
      pt: 'Solicite a exclusão dos seus dados enquanto mantém sua conta ativa.',
    },
    subject: { en: 'Data Deletion Request', pt: 'Solicitação de Exclusão de Dados' },
  },
];

function PrivacyPolicyPage() {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  // O documento e servido como pt-BR no index.html; sem isso, leitores de tela e
  // tradutores automaticos tratariam o texto em ingles como se fosse portugues.
  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'pt-BR';
  }, [locale]);

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      }
    };

    let observer: IntersectionObserver | null = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px',
      threshold: 1,
    });

    for (const el of Object.values(sectionRefs.current)) {
      observer?.observe(el);
    }

    return () => {
      observer?.disconnect();
      observer = null;
    };
  }, []);

  const addSectionRef = (id: string, ref: HTMLElement | null) => {
    if (ref) sectionRefs.current[id] = ref;
  };

  const t = chrome[locale];
  const tocEntries = [...sections.map(({ id, toc }) => ({ id, label: toc[locale] })), { id: 'section-actions', label: t.deletionToc }];

  return (
    <section className="py-32">
      <div className="container max-w-7xl">
        <div className="relative grid-cols-3 gap-20 lg:grid">
          <div className="lg:col-span-2">
            <div className="mb-12">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="font-extrabold text-3xl">{t.title}</h1>
                <Button variant="outline" size="sm" onClick={() => setLocale(locale === 'en' ? 'pt' : 'en')}>
                  <Languages className="size-4" />
                  {t.switchLabel}
                </Button>
              </div>
              <p className="mt-2 text-lg text-muted-foreground">{t.subtitle}</p>
              <p className="mt-1 text-muted-foreground text-xs">{t.dates}</p>
            </div>

            {sections.map(({ id, heading, body }) => (
              <section key={id} id={id} ref={(ref) => addSectionRef(id, ref)} className="prose dark:prose-invert mb-8">
                <ItemTitle className="text-2xl">{heading[locale]}</ItemTitle>
                {body[locale]}
              </section>
            ))}

            <section id="section-actions" ref={(ref) => addSectionRef('section-actions', ref)} className="mt-16 border-t pt-8">
              <h2 className="mb-8 font-medium text-2xl">{t.deletionHeading}</h2>
              <div className="space-y-6">
                {deletionCards.map(({ icon: Icon, title, description, subject }) => (
                  <div key={title.en} className="border-border border-b pb-6 last:border-b-0">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <div className="md:w-2/3">
                        <div className="mb-2 flex items-center gap-3">
                          <Icon className="size-5 text-blue-700" />
                          <h3 className="font-medium text-lg">{title[locale]}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{description[locale]}</p>
                      </div>
                      <div className="md:w-1/3 md:text-right">
                        <Button variant="outline" asChild>
                          <a href={`mailto:${DELETION_EMAIL}?subject=${encodeURIComponent(subject[locale])}`}>
                            <Mail className="size-4" />
                            {t.cta}
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="sticky top-8 hidden h-fit lg:block">
            <span className="flex items-center gap-2 text-sm">
              <AlignLeft className="size-4" />
              {t.onThisPage}
            </span>
            <nav className="mt-2 text-sm">
              <ul>
                {tocEntries.map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className={cn('block py-1 transition-colors duration-200', activeSection === id ? 'font-medium text-primary' : 'text-muted-foreground hover:text-primary')}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
