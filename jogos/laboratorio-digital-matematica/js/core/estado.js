// O armazenamento fica somente neste aparelho e pode estar indisponível em navegação privada.
export function ler(chave, padrao=null){try{const v=localStorage.getItem('ldm:'+chave);return v===null?padrao:JSON.parse(v)}catch{return padrao}}
export function salvar(chave, valor){try{localStorage.setItem('ldm:'+chave,JSON.stringify(valor));return true}catch{return false}}
export function concluir(modulo){const feitos=ler('concluidos',{});feitos[modulo]=new Date().toISOString();salvar('concluidos',feitos)}
