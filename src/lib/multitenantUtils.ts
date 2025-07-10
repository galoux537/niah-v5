// Utilitários para garantir isolamento multitenant
export class MultitenantUtils {
  
  /**
   * Gera agentes únicos baseados no nome/ID da empresa
   * Evita duplicação entre empresas diferentes
   */
  static generateUniqueAgentsForCompany(companyName: string, companyId: string): Array<{
    name: string;
    email: string;
    department: string;
    calls: number;
    score: number;
  }> {
    // Criar hash único baseado no nome + ID da empresa
    const companyHash = this.createCompanyHash(companyName, companyId);
    
    const firstNames = [
      'Ana', 'Carlos', 'Mariana', 'João', 'Fernanda', 'Ricardo', 
      'Beatriz', 'Rafael', 'Camila', 'Diego', 'Larissa', 'Bruno', 
      'Patrícia', 'Thiago', 'Juliana', 'Rodrigo', 'Amanda', 'Felipe', 
      'Gabriela', 'Lucas', 'Priscila', 'André', 'Vanessa', 'Gustavo'
    ];
    
    const lastNames = [
      'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 
      'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 
      'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 
      'Vieira', 'Barbosa', 'Nascimento', 'Ramos', 'Araújo', 'Castro'
    ];
    
    const departments = [
      'Vendas', 'Suporte', 'Atendimento', 'Comercial', 'SAC', 
      'Técnico', 'Relacionamento', 'Retenção', 'Cobrança'
    ];
    
    const agents = [];
    
    // Gerar 6 agentes únicos
    for (let i = 0; i < 6; i++) {
      const seed = companyHash + (i * 17); // Usar multiplicador primo para distribuição
      
      const firstNameIndex = seed % firstNames.length;
      const lastNameIndex = (seed * 7) % lastNames.length;
      const departmentIndex = (seed * 3) % departments.length;
      
      const firstName = firstNames[firstNameIndex];
      const lastName = lastNames[lastNameIndex];
      const department = departments[departmentIndex];
      
      // Gerar dominio de email único para a empresa
      const emailDomain = this.generateEmailDomain(companyName);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`;
      
      // Gerar métricas baseadas no seed
      const calls = 15 + (seed % 40); // Entre 15 e 54 chamadas
      const scoreBase = 6.5 + ((seed % 30) / 10); // Entre 6.5 e 9.4
      const score = Math.max(0, Math.min(9.5, Number(scoreBase.toFixed(2))));
      
      agents.push({
        name: `${firstName} ${lastName}`,
        email,
        department,
        calls,
        score
      });
    }
    
    return agents;
  }

  /**
   * Cria hash único para a empresa baseado no nome e ID
   */
  private static createCompanyHash(companyName: string, companyId: string): number {
    const combined = `${companyName.toLowerCase()}_${companyId}`;
    let hash = 0;
    
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit integer
    }
    
    return Math.abs(hash);
  }

  /**
   * Gera domínio de email único para a empresa
   */
  private static generateEmailDomain(companyName: string): string {
    const cleanName = companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '') // Remove espaços
      .substring(0, 12); // Limita tamanho
      
    // Adiciona sufixo para evitar conflitos
    const suffix = cleanName.length > 6 ? 'corp' : 'company';
    
    return `${cleanName}${suffix}.com.br`;
  }

  /**
   * Gera número de telefone único baseado na empresa e índice
   */
  static generateUniquePhoneNumber(companyName: string, companyId: string, index: number): string {
    const companyHash = this.createCompanyHash(companyName, companyId);
    const phoneNumber = (companyHash + (index * 13)) % 100000000; // Usar primo para distribuição
    
    return `+55 11 9${phoneNumber.toString().padStart(8, '0')}`;
  }

  /**
   * Valida se os dados pertencem à empresa correta (segurança multitenant)
   */
  static validateCompanyOwnership(
    dataCompanyId: string, 
    userCompanyId: string, 
    dataType: string = 'dados'
  ): { isValid: boolean; error?: string } {
    if (!dataCompanyId || !userCompanyId) {
      return {
        isValid: false,
        error: `IDs de empresa inválidos: data=${dataCompanyId}, user=${userCompanyId}`
      };
    }

    if (dataCompanyId !== userCompanyId) {
      return {
        isValid: false,
        error: `Violação multitenant: tentativa de acesso a ${dataType} de outra empresa (${dataCompanyId} != ${userCompanyId})`
      };
    }

    return { isValid: true };
  }

  /**
   * Log de auditoria para operações multitenant
   */
  static logMultitenantOperation(
    operation: string,
    companyId: string,
    companyName: string,
    details?: any
  ): void {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      operation,
      companyId,
      companyName,
      details: details || {}
    };

    // Log no console com emoji para facilitar identificação
    console.log(`🏢 [MULTITENANT] ${timestamp} - ${operation}`, logData);

    // Em produção, aqui você poderia enviar para um serviço de logging
    // como Sentry, LogRocket, ou sistema próprio de auditoria
  }

  /**
   * Gera dados de teste únicos para uma empresa específica
   */
  static generateCompanyTestData(companyName: string, companyId: string) {
    const agents = this.generateUniqueAgentsForCompany(companyName, companyId);
    
    return {
      agents,
      totalAgents: agents.length,
      totalPlannedCalls: agents.reduce((sum, agent) => sum + agent.calls, 0),
      averageScore: agents.reduce((sum, agent) => sum + agent.score, 0) / agents.length,
      emailDomain: this.generateEmailDomain(companyName),
      companyHash: this.createCompanyHash(companyName, companyId)
    };
  }

  /**
   * Verifica se há duplicação de agentes entre empresas
   */
  static checkForAgentDuplication(agents: Array<{ name: string; company_id: string }>): {
    hasDuplication: boolean;
    duplicatedAgents: Array<{ name: string; companies: string[] }>;
  } {
    const agentsByName = new Map<string, Set<string>>();
    
    // Agrupar agentes por nome e coletar empresas
    agents.forEach(agent => {
      if (!agentsByName.has(agent.name)) {
        agentsByName.set(agent.name, new Set());
      }
      agentsByName.get(agent.name)?.add(agent.company_id);
    });

    // Encontrar duplicações
    const duplicatedAgents: Array<{ name: string; companies: string[] }> = [];
    
    agentsByName.forEach((companies, name) => {
      if (companies.size > 1) {
        duplicatedAgents.push({
          name,
          companies: Array.from(companies)
        });
      }
    });

    return {
      hasDuplication: duplicatedAgents.length > 0,
      duplicatedAgents
    };
  }
}
