import React, { useState } from 'react';

// --- DATOS DE LA WIKI: CONTENIDO DETALLADO ---
const wikiData = [
  {
    category: '01–04 Fundamentos y administración',
    pages: [
      {
        id: 'fundamentos-cloud',
        title: 'Cloud Computing y Arquitectura',
        content: `El Cloud Computing en Azure se basa en el cambio de un modelo CapEx (Gasto de Capital en hardware físico) a un modelo OpEx (Gasto Operativo mensual). 

Azure opera a nivel global dividiendo su infraestructura en:
• Regiones: Áreas geográficas que contienen múltiples centros de datos (ej. East US).
• Zonas de Disponibilidad (AZs): Centros de datos físicamente separados dentro de una misma región, con energía, refrigeración y redes independientes, protegiendo contra fallas locales.

Modelos de servicio:
1. IaaS (Infraestructura): Tú gestionas el SO, los datos y las aplicaciones.
2. PaaS (Plataforma): Azure gestiona el SO y la red; tú te enfocas en el código y los datos.
3. SaaS (Software): Azure gestiona todo, tú solo consumes el software (ej. Office 365).`,
        details: 'El Microsoft Azure Well-Architected Framework (WAF) recomienda usar PaaS siempre que sea posible, ya que reduce la carga operativa y transfiere la responsabilidad de los parches de seguridad a Microsoft.',
        commandTitle: 'Listar las regiones disponibles en Azure:',
        command: `az account list-locations --query "[].{Name:name, DisplayName:displayName}" --output table`
      },
      {
        id: 'resource-groups',
        title: 'Resource Groups y CLI',
        content: `Azure Resource Manager (ARM) es el servicio de implementación y administración subyacente. Todo recurso en Azure (una base de datos, una máquina virtual, una IP) debe residir en un Grupo de Recursos (Resource Group).

Características de los Grupos de Recursos:
• Ciclo de vida unificado: Si eliminas un grupo de recursos, se eliminan todos los recursos dentro de él.
• Control de Acceso: Puedes aplicar RBAC a nivel de grupo para que un equipo solo administre ese entorno.
• Etiquetas (Tags): Metadatos (clave-valor) esenciales para facturación (ej. "Departamento: Finanzas", "Entorno: Producción").
• Bloqueos (Locks): Previenen modificaciones accidentales (ReadOnly) o eliminaciones (CanNotDelete).`,
        details: 'La Azure CLI permite automatizar la creación de entornos. Es idempotente en muchos comandos, lo que significa que puedes ejecutar el script varias veces de forma segura.',
        commandTitle: 'Crear Grupo de Recursos, etiquetarlo y bloquearlo:',
        command: `# 1. Crear RG con etiquetas
az group create --name RG-Produccion --location eastus --tags Entorno=Prod Proyecto=Wiki

# 2. Aplicar un bloqueo contra eliminación accidental
az lock create --name BloqueoSeguridad --lock-type CanNotDelete --resource-group RG-Produccion`
      }
    ]
  },
  {
    category: '05–08 Infraestructura y redes',
    pages: [
      {
        id: 'compute-storage',
        title: 'Virtual Machines y Storage',
        content: `Cómputo (Máquinas Virtuales):
Las VMs ofrecen control total (IaaS). Se componen de una imagen base (SO), un tamaño (SKU que define CPU/RAM), una interfaz de red (NIC) y discos administrados (Managed Disks). 

Almacenamiento (Azure Storage Account):
Solución PaaS masivamente escalable. Ofrece cuatro servicios principales:
• Blob Storage: Para datos no estructurados (imágenes, backups). Soporta niveles de acceso: Hot (frecuente), Cool (infrecuente, +30 días) y Archive (larga retención, +180 días).
• File Storage: Carpetas compartidas mediante protocolo SMB.
• Queue Storage: Colas de mensajería para desacoplar aplicaciones.
• Table Storage: Base de datos NoSQL de clave-valor ultrarrápida.`,
        details: 'Por seguridad, las cuentas de almacenamiento deben deshabilitar el acceso público (Anonymous Access), forzar la transferencia segura (HTTPS) y usar cifrado de disco del lado del servidor (SSE) o del cliente.',
        commandTitle: 'Desplegar Storage seguro y crear un contenedor Blob:',
        command: `# 1. Crear cuenta forzando HTTPS y desactivando acceso público
az storage account create --name storageseguro123 --resource-group RG-Produccion --location eastus --sku Standard_LRS --https-only true --allow-blob-public-access false

# 2. Crear un contenedor dentro de la cuenta
az storage container create --name backups --account-name storageseguro123`
      },
      {
        id: 'redes-vpn',
        title: 'VNets, VPN y Load Balancer',
        content: `Las Redes Virtuales (VNets) proporcionan aislamiento. Se dividen en Subredes (Subnets) para segmentar capas de la aplicación (ej. Frontend, Backend, Base de Datos).

Componentes clave:
• Grupos de Seguridad de Red (NSG): Actúan como firewalls básicos basados en reglas de 5 tuplas (IP origen, IP destino, puerto origen, puerto destino, protocolo).
• VNet Peering: Permite conectar dos VNets en la misma o diferentes regiones de forma privada.
• Balanceadores de carga: 
  - Azure Load Balancer: Balanceo en capa 4 (TCP/UDP).
  - Application Gateway: Balanceo en capa 7 (HTTP/HTTPS) con Firewall de Aplicaciones Web (WAF) incorporado.
• VPN Gateway: Túneles cifrados IPsec Site-to-Site para conectar tu red on-premise con Azure.`,
        details: 'El diseño Zero Trust exige denegar todo el tráfico entrante de internet por defecto en los NSGs y usar Application Gateway con WAF activado para prevenir inyecciones SQL y Cross-Site Scripting (XSS).',
        commandTitle: 'Crear VNet, Subred y Grupo de Seguridad (NSG):',
        command: `# 1. Crear VNet y Subred de Frontend
az network vnet create --name MiVNet --resource-group RG-Produccion --address-prefix 10.0.0.0/16 --subnet-name FrontendSubnet --subnet-prefix 10.0.1.0/24

# 2. Crear un NSG y regla para permitir HTTPS
az network nsg create --name WebNSG --resource-group RG-Produccion
az network nsg rule create --nsg-name WebNSG --resource-group RG-Produccion --name PermitirHTTPS --priority 100 --destination-port-ranges 443 --access Allow --protocol Tcp`
      }
    ]
  },
  {
    category: '09–12 Identidad, seguridad y datos',
    pages: [
      {
        id: 'identidad-rbac',
        title: 'Entra ID, RBAC y MFA',
        content: `Microsoft Entra ID (Identity and Access Management):
A diferencia de Active Directory local, Entra ID utiliza protocolos modernos (SAML, OAuth 2.0, OpenID Connect).

Seguridad e Identidad:
• RBAC (Control de Acceso Basado en Roles): Se compone de Principales de Seguridad (Usuarios, Grupos, Service Principals), Definiciones de Rol (Owner, Contributor, Reader) y Ámbitos (Suscripción, Grupo de Recursos, Recurso).
• Acceso Condicional: Es el núcleo de Zero Trust. Analiza señales en tiempo real (IP, dispositivo corporativo, riesgo del usuario) antes de permitir el acceso, forzando MFA (Autenticación Multifactor) si detecta anomalías.
• Identidades Administradas (Managed Identities): Permiten que un recurso (ej. una VM o App Service) se autentique contra otro (ej. Key Vault) sin tener credenciales en el código.`,
        details: 'Las identidades administradas (System-assigned) eliminan por completo la filtración de credenciales, ya que Azure gestiona y rota automáticamente los tokens temporalmente detrás de escena.',
        commandTitle: 'Habilitar Identidad Administrada en una VM y darle acceso:',
        command: `# 1. Habilitar la identidad administrada asignada por el sistema en una VM
az vm identity assign --name MiServidorWeb --resource-group RG-Produccion

# 2. Asignar permiso de lectura a la VM sobre una cuenta de almacenamiento
az role assignment create --assignee <ID-PRINCIPAL-DE-LA-VM> --role "Storage Blob Data Reader" --scope /subscriptions/{sub-id}/resourceGroups/RG-Produccion/providers/Microsoft.Storage/storageAccounts/storageseguro123`
      },
      {
        id: 'keyvault-cifrado',
        title: 'Key Vault y Cifrado',
        content: `Azure Key Vault es un servicio de HSM (Hardware Security Module) alojado en la nube diseñado para proteger y controlar de forma estricta el acceso a datos sensibles.

Tipos de datos que gestiona:
• Secretos: Cadenas de conexión, contraseñas, tokens de API.
• Claves (Keys): Claves criptográficas asimétricas usadas para cifrar discos de máquinas virtuales (Azure Disk Encryption) o bases de datos (TDE - Transparent Data Encryption).
• Certificados: Gestión automática del ciclo de vida y renovación de certificados SSL/TLS.

Características de resiliencia:
• Soft-Delete (Eliminación temporal): Retiene bóvedas o secretos eliminados entre 7 y 90 días para evitar pérdida de datos por ataques internos o errores.
• Purge Protection (Protección de purga): Bloquea la capacidad de eliminar permanentemente los datos incluso dentro del período de Soft-Delete.`,
        details: 'El WAF establece que ninguna aplicación debe tener secretos hardcodeados. Las apps deben extraer los secretos en tiempo de ejecución conectándose al Key Vault mediante su Identidad Administrada.',
        commandTitle: 'Crear un Key Vault con protección contra borrado accidental:',
        command: `az keyvault create --name "ProduccionKV-9988" \
                   --resource-group RG-Produccion \
                   --location eastus \
                   --enable-soft-delete true \
                   --enable-purge-protection true \
                   --enable-rbac-authorization true`
      }
    ]
  },
  {
    category: '13–16 DevOps y automatización',
    pages: [
      {
        id: 'devops-contenedores',
        title: 'Docker, AKS y CI/CD',
        content: `La automatización de despliegues (DevOps) une el desarrollo y la operación mediante prácticas de Integración Continua (CI) y Despliegue Continuo (CD).

Contenedores en Azure:
• Azure Container Registry (ACR): Un registro privado y seguro (similar a Docker Hub) para almacenar tus imágenes de contenedores, con análisis de vulnerabilidades integrado.
• Azure Kubernetes Service (AKS): Orquestador gestionado. Microsoft administra el "Control Plane" (API, Scheduler) gratuitamente; tú solo pagas y administras los "Nodes" (Máquinas virtuales que ejecutan tus Pods).

Pipelines (GitHub Actions / Azure Pipelines):
Permiten que, al hacer un 'git push', un servidor compile el código, ejecute pruebas unitarias, construya la imagen Docker, la envíe al ACR y actualice el clúster AKS sin intervención humana.`,
        details: 'Al usar AKS, se recomienda activar "Azure CNI" para integración nativa con redes virtuales, permitiendo aplicar Network Policies (reglas de firewall internas) que limitan qué Pod puede comunicarse con qué Pod.',
        commandTitle: 'Crear un Container Registry privado y un clúster AKS:',
        command: `# 1. Crear un Azure Container Registry (ACR)
az acr create --resource-group RG-Produccion --name miregistroempresarial --sku Standard

# 2. Crear un AKS vinculándolo al ACR para que pueda descargar imágenes
az aks create --resource-group RG-Produccion --name ClusterProduccion --node-count 3 --attach-acr miregistroempresarial --generate-ssh-keys`
      },
      {
        id: 'iac-bicep',
        title: 'Infraestructura como Código (IaC)',
        content: `IaC reemplaza la creación manual de recursos (hacer clics en el portal) por archivos de código que describen la arquitectura deseada.

Ventajas:
• Repetibilidad: Puedes crear entornos idénticos (Dev, QA, Prod) en minutos.
• Control de Versiones: La infraestructura se guarda en Git, permitiendo ver el historial de cambios y revertirlos.
• Declarativo vs Imperativo: Tú defines *qué* quieres tener (declarativo), no el paso a paso de *cómo* crearlo.

Herramientas:
• Bicep: Lenguaje nativo de Microsoft, transparente, de sintaxis limpia y que soporta todas las características de Azure desde el Día 1.
• Terraform: Herramienta agnóstica de nube (HashiCorp) que usa archivos de estado (State files) para llevar un registro de lo que ha sido desplegado.`,
        details: 'El pilar de Excelencia Operativa del WAF exige que todas las cargas de trabajo de producción se desplieguen única y exclusivamente mediante IaC (Bicep o Terraform) a través de un Pipeline automatizado.',
        commandTitle: 'Desplegar infraestructura con un archivo Bicep y revisar cambios previos:',
        command: `# 1. Analizar qué cambios hará el archivo antes de desplegarlo (What-If)
az deployment group what-if --resource-group RG-Produccion --template-file infraestructura.bicep

# 2. Ejecutar el despliegue real
az deployment group create --resource-group RG-Produccion --template-file infraestructura.bicep`
      }
    ]
  },
  {
    category: '17–20 Nivel avanzado y experto',
    pages: [
      {
        id: 'monitor-sentinel',
        title: 'Monitor, Sentinel y Defender',
        content: `La seguridad avanzada requiere visibilidad total. Azure unifica esto en un Workspace de Log Analytics, donde toda la telemetría se consulta mediante lenguaje KQL (Kusto Query Language).

Componentes de Seguridad y Gobernanza:
• Azure Monitor: Recolecta métricas de rendimiento (CPU/RAM) y logs de aplicaciones (Application Insights). Permite crear Alertas Automáticas.
• Microsoft Defender for Cloud: Evalúa continuamente tu infraestructura (CSPM) dándote una puntuación (Secure Score) y recomendaciones para cumplir normativas (NIST, ISO 27001). Protege cargas de trabajo (CWP).
• Microsoft Sentinel: Es el SIEM (Security Information and Event Management) y SOAR de Azure. Usa Inteligencia Artificial para detectar patrones de ataque complejos, correlacionando logs de Azure, Office 365 y firewalls externos.
• Azure Policy: Aplica gobernanza corporativa. Ejemplo: bloquear la creación de recursos fuera de la región "East US" o exigir que todo tenga etiquetas.`,
        details: 'La integración SOAR en Sentinel permite respuestas automatizadas. Si detecta un inicio de sesión comprometido, un Playbook de Logic Apps puede deshabilitar al usuario en Entra ID y aislar la VM en segundos.',
        commandTitle: 'Asignar una política corporativa restrictiva:',
        command: `# Asignar política integrada para requerir la etiqueta 'CentroCostos' en todos los recursos
az policy assignment create --name "Requerir-Etiqueta" \
                            --policy "1e30110a-5ceb-460c-a204-c1c3969c6d62" \
                            --scope /subscriptions/{sub-id}/resourceGroups/RG-Produccion \
                            --params '{"tagName": {"value": "CentroCostos"}}'`
      },
      {
        id: 'arquitectura-ha',
        title: 'Alta Disponibilidad (HA) y DR',
        content: `Las aplicaciones de misión crítica deben tolerar fallas de hardware, de centros de datos y de regiones enteras.

Tolerancia a fallos:
• Zonas de Disponibilidad (HA): Tus servidores operan en múltiples centros de datos locales (ej. Zona 1 y Zona 2). Si uno se inunda o pierde energía, el servicio continúa.
• Azure Front Door / Traffic Manager: Balanceadores globales. Si la región "East US" cae, redirigen automáticamente el tráfico de los usuarios a "West Europe".

Recuperación ante Desastres (DR):
• RTO (Recovery Time Objective): Tiempo máximo aceptable que el sistema puede estar caído (ej. 4 horas).
• RPO (Recovery Point Objective): Cantidad máxima de datos que la empresa está dispuesta a perder (ej. backups de hace 15 minutos).
• Azure Site Recovery (ASR): Replica máquinas virtuales en tiempo real hacia una región secundaria para activarlas en caso de un desastre.`,
        details: 'El almacenamiento debe usar GRS (Geo-Redundant Storage) o GZRS. En GRS, los datos se escriben sincrónicamente 3 veces en la región principal, y luego se replican asincrónicamente a un centro de datos a cientos de kilómetros de distancia.',
        commandTitle: 'Replicar tráfico a nivel global usando Traffic Manager:',
        command: `# 1. Crear el perfil de Traffic Manager (Enrutamiento por prioridad)
az network traffic-manager profile create --name EnrutadorGlobal --resource-group RG-Produccion --routing-method Priority --unique-dns-name miempresa-app

# 2. Agregar los Endpoints regionales al perfil
az network traffic-manager endpoint create --name EndpointPrimario --profile-name EnrutadorGlobal --resource-group RG-Produccion --type azureEndpoints --priority 1 --target-resource-id <ID-AppService-Region1>`
      }
    ]
  },
  {
    category: 'Referencia Completa: Azure CLI',
    pages: [
      {
        id: 'cmd-core',
        title: '1. Cuentas, Suscripciones y Grupos (az account / group)',
        content: `La base de cualquier interacción con Azure CLI. Antes de operar, debes autenticarte, seleccionar el contexto (suscripción) adecuado y preparar los grupos lógicos.`,
        details: 'Usa `az account set` siempre que cambies de proyecto para no desplegar recursos en la suscripción de producción por error.',
        commandTitle: 'Comandos base (Core):',
        command: `# Iniciar sesión interactiva
az login

# Iniciar sesión con un Service Principal (Automatización CI/CD)
az login --service-principal -u <app-id> -p <password> --tenant <tenant-id>

# Listar todas las suscripciones disponibles
az account list --output table

# Cambiar la suscripción activa
az account set --subscription "Nombre o ID de la suscripción"

# Crear un Grupo de Recursos
az group create --name MiGrupoRG --location eastus

# Listar todos los Grupos de Recursos
az group list -o table

# Eliminar un Grupo de Recursos (y todo lo que contiene)
az group delete --name MiGrupoRG --yes --no-wait`
      },
      {
        id: 'cmd-network',
        title: '2. Redes y Seguridad (az network)',
        content: `Comandos para construir la topología de red, incluyendo Virtual Networks (VNets), subredes, IPs públicas y firewalls (Grupos de Seguridad de Red - NSG).`,
        details: 'Al crear reglas NSG, asegúrate de utilizar prioridades espaciadas (ej. 100, 110, 120) para poder insertar reglas intermedias en el futuro sin reescribir todo.',
        commandTitle: 'Comandos de Red (Network):',
        command: `# Crear una VNet con subred inicial
az network vnet create -g MiGrupoRG -n MiVnet --address-prefix 10.0.0.0/16 --subnet-name Subred1 --subnet-prefix 10.0.1.0/24

# Solicitar una dirección IP Pública estática
az network public-ip create -g MiGrupoRG -n MiIpPublica --allocation-method Static --sku Standard

# Crear un Network Security Group (NSG)
az network nsg create -g MiGrupoRG -n MiNSG

# Agregar regla al NSG para permitir puerto 80 (HTTP)
az network nsg rule create -g MiGrupoRG --nsg-name MiNSG -n PermitirWeb --priority 100 --destination-port-ranges 80 --access Allow --protocol Tcp

# Asociar NSG a una subred
az network vnet subnet update -g MiGrupoRG --vnet-name MiVnet -n Subred1 --network-security-group MiNSG`
      },
      {
        id: 'cmd-compute',
        title: '3. Cómputo (az vm / az webapp)',
        content: `Gestión de Máquinas Virtuales (IaaS) y App Services (PaaS). Permite provisionar infraestructura para alojar aplicaciones.`,
        details: 'Para ahorrar costos en entornos de desarrollo, usa `--no-wait` al apagar (deallocate) VMs al final del día. Detener (stop) una VM sin "deallocate" sigue cobrando el hardware.',
        commandTitle: 'Comandos de Cómputo (Compute):',
        command: `# Crear una Máquina Virtual Linux rápida
az vm create -g MiGrupoRG -n ServidorLinux --image Ubuntu2204 --admin-username azureuser --generate-ssh-keys

# Apagar una VM y liberar hardware para no pagar (Deallocate)
az vm deallocate -g MiGrupoRG -n ServidorLinux

# Iniciar una VM apagada
az vm start -g MiGrupoRG -n ServidorLinux

# Listar todas las VMs y su estado de energía
az vm list -d -o table

# Crear un App Service Plan (Infraestructura PaaS)
az appservice plan create -g MiGrupoRG -n MiPlanApp --sku B1 --is-linux

# Desplegar un Web App (PaaS) en el plan anterior
az webapp create -g MiGrupoRG -p MiPlanApp -n MiSitioWebReact --runtime "NODE:18-lts"`
      },
      {
        id: 'cmd-storage',
        title: '4. Almacenamiento (az storage)',
        content: `Comandos para administrar Storage Accounts, contenedores Blob, File Shares y transferencia de datos.`,
        details: 'Las operaciones directas sobre blobs (subir, bajar, listar) a menudo requieren pasar la Account Key o generar un token SAS para autenticar la solicitud CLI.',
        commandTitle: 'Comandos de Almacenamiento (Storage):',
        command: `# Crear Storage Account
az storage account create -n misau001 -g MiGrupoRG --location eastus --sku Standard_LRS

# Obtener las llaves de acceso del Storage Account
az storage account keys list -g MiGrupoRG -n misau001 -o table

# Crear un contenedor Blob (se necesita la key)
az storage container create --name imagenes --account-name misau001 --account-key <clave-copiada>

# Subir un archivo al Blob
az storage blob upload --account-name misau001 --account-key <clave> --container-name imagenes --file ruta/local/foto.png --name foto.png

# Generar un token SAS con permisos de lectura por 1 hora
az storage blob generate-sas --account-name misau001 --container-name imagenes --name foto.png --permissions r --expiry 2024-12-31T23:59Z --account-key <clave>`
      },
      {
        id: 'cmd-iam',
        title: '5. Identidad y RBAC (az ad / az role)',
        content: `Administración de Microsoft Entra ID (usuarios, service principals) y asignación de roles de control de acceso en Azure (RBAC).`,
        details: 'La estructura RBAC requiere identificar "a quién" (assignee), "qué permiso" (role) y "dónde" (scope).',
        commandTitle: 'Comandos de Identidad (IAM):',
        command: `# Crear un usuario en Entra ID
az ad user create --display-name "Juan Perez" --password "Fuerte123!" --user-principal-name juan@dominio.onmicrosoft.com

# Listar definiciones de roles disponibles
az role definition list --name "Reader" -o table

# Asignar rol Contributor a un usuario sobre un Grupo de Recursos
az role assignment create --assignee juan@dominio.onmicrosoft.com --role "Contributor" --resource-group MiGrupoRG

# Crear un Service Principal (App Registration) para GitHub Actions
az ad sp create-for-rbac --name "MiAppCI" --role contributor --scopes /subscriptions/<sub-id>/resourceGroups/MiGrupoRG --sdk-auth`
      }
    ]
  }
];

// --- COMPONENTE DE CÓDIGO ---
const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.codeContainer}>
      <button onClick={handleCopy} style={styles.copyBtn}>{copied ? '¡Copiado!' : 'Copiar'}</button>
      <pre style={styles.pre}><code>{code}</code></pre>
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---
export default function App() {
  const [activeTab, setActiveTab] = useState('fundamentos-cloud');
  
  // Buscar la página activa recorriendo las categorías
  let activePage = null;
  wikiData.forEach(cat => {
    const page = cat.pages.find(p => p.id === activeTab);
    if (page) activePage = page;
  });

  return (
    <div style={styles.appLayout}>
      <nav style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarTitle}>Azure Wiki</h2>
          <p style={styles.sidebarSubtitle}>Contenido 01-20</p>
        </div>
        <div style={styles.navScroll}>
          {wikiData.map((category, index) => (
            <div key={index} style={styles.categoryContainer}>
              <h4 style={styles.categoryTitle}>{category.category}</h4>
              <ul style={styles.navList}>
                {category.pages.map((page) => (
                  <li key={page.id} style={styles.navItem}>
                    <button
                      onClick={() => setActiveTab(page.id)}
                      style={{
                        ...styles.navButton,
                        ...(activeTab === page.id ? styles.navButtonActive : {})
                      }}
                    >
                      {page.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <main style={styles.mainContent}>
        <header style={styles.contentHeader}>
          <h1 style={styles.h1}>{activePage.title}</h1>
        </header>
        <section style={styles.article}>
          <p style={styles.paragraph}>{activePage.content}</p>
          <div style={styles.infoBox}>
            <strong>Detalle Técnico / Seguridad:</strong>
            <p style={{marginTop: '8px', marginBottom: 0}}>{activePage.details}</p>
          </div>
          <h3 style={styles.h3}>{activePage.commandTitle}</h3>
          <CodeBlock code={activePage.command} />
        </section>
      </main>
    </div>
  );
}

// --- ESTILOS EN LÍNEA MEJORADOS ---
const styles = {
  appLayout: { display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, Helvetica, sans-serif', backgroundColor: '#f3f2f1', margin: 0 },
  sidebar: { width: '330px', backgroundColor: '#0078d4', color: 'white', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' },
  sidebarHeader: { padding: '25px 20px', borderBottom: '1px solid rgba(255,255,255,0.2)' },
  sidebarTitle: { fontSize: '22px', margin: '0 0 5px 0', fontWeight: '600' },
  sidebarSubtitle: { fontSize: '14px', margin: 0, opacity: 0.9, color: '#c7e0f4' },
  navScroll: { overflowY: 'auto', flex: 1, padding: '15px 0' },
  categoryContainer: { marginBottom: '20px' },
  categoryTitle: { fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.2px', margin: '15px 20px 8px 20px', color: '#82c8f9', fontWeight: 'bold' },
  navList: { listStyle: 'none', padding: '0', margin: 0 },
  navItem: { margin: '0' },
  navButton: { width: '100%', textAlign: 'left', padding: '12px 20px 12px 30px', backgroundColor: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '14px', transition: '0.2s', lineHeight: '1.4' },
  navButtonActive: { backgroundColor: 'rgba(255,255,255,0.2)', borderLeft: '4px solid #fff', fontWeight: 'bold' },
  mainContent: { flex: 1, padding: '50px', overflowY: 'auto' },
  contentHeader: { marginBottom: '35px', borderBottom: '2px solid #edebe9', paddingBottom: '15px' },
  h1: { color: '#323130', margin: 0, fontSize: '34px', fontWeight: '600', letterSpacing: '-0.5px' },
  article: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.06)', maxWidth: '950px' },
  // whiteSpace: 'pre-wrap' permite que los saltos de línea del string (\n) se rendericen visualmente
  paragraph: { fontSize: '17px', lineHeight: '1.7', color: '#3b3a39', marginBottom: '25px', whiteSpace: 'pre-wrap' },
  infoBox: { backgroundColor: '#f0f6ff', borderLeft: '5px solid #0078d4', padding: '20px', borderRadius: '0 6px 6px 0', color: '#201f1e', marginBottom: '35px', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap' },
  h3: { color: '#323130', fontSize: '18px', marginBottom: '15px', fontWeight: '600' },
  codeContainer: { position: 'relative', backgroundColor: '#1e1e1e', borderRadius: '6px', overflow: 'hidden', marginTop: '10px', border: '1px solid #333' },
  copyBtn: { position: 'absolute', top: '10px', right: '10px', backgroundColor: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', transition: '0.2s' },
  pre: { margin: 0, padding: '20px', overflowX: 'auto', color: '#d4d4d4', fontSize: '14.5px', fontFamily: 'Consolas, Monaco, "Courier New", monospace', lineHeight: '1.6' }
};