// ============================================================
// VIEW: CERTIFICADOS
// ============================================================
// CORREÇÃO: imports com '../'
import { S, role, isAdmin, isProf, uid, nav } from '../state.js'
import { toast, handleError, $, $$ } from '../utils.js'
import { sb, sbGetCertificados } from '../supabase-client.js'

export function vCerts() {
    let h = `<div class="btn-back" onclick="nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">Certificados</h2><p class="wcs">Todos os certificados emitidos pela SulSafe.</p>`
    h += `<div id="certList"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando...</p></div></div>`

    setTimeout(() => {
        carregarCertificados()
    }, 100)

    return h
}

export async function carregarCertificados() {
    const container = document.getElementById('certList')
    if (!container) return

    try {
        const { data: certs } = await sbGetCertificados(S.user.id)
        if (!certs || certs.length === 0) {
            container.innerHTML = `<div class="empty"><i class="fas fa-certificate"></i><p>Nenhum certificado emitido ainda.</p></div>`
            return
        }

        let html = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">`
        certs.forEach(c => {
            html += `<div class="nr-c" style="flex-direction:column;gap:8px;padding:16px;border:1px solid var(--bd);border-radius:var(--radius);">
                <div style="display:flex;align-items:center;gap:12px;">
                    <i class="fas fa-certificate" style="font-size:28px;color:var(--dourado);"></i>
                    <div><strong>${c.titulo}</strong><br><span style="font-size:12px;color:var(--tx3);">Emitido em ${new Date(c.emitido_em).toLocaleDateString('pt-BR')}</span></div>
                </div>
                <div style="display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--bd2);padding-top:8px;">
                    <button class="btn btn-sm btn-p" onclick="visualizarCert('${c.id}')"><i class="fas fa-eye"></i> Visualizar</button>
                    <button class="btn btn-sm btn-s" onclick="baixarCert('${c.id}')"><i class="fas fa-download"></i> Baixar</button>
                    ${isAdmin() || isProf() ? `<button class="btn btn-sm btn-danger" onclick="revogarCert('${c.id}')"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            </div>`
        })
        html += `</div>`
        container.innerHTML = html
    } catch (err) {
        toast('Erro ao carregar certificados', 'err')
        console.error(err)
    }
}

window.visualizarCert = async function(id) {
    // Abre modal com visualização do certificado (PDF ou imagem)
    try {
        const { data: cert } = await sb.from('certificados').select('*').eq('id', id).single()
        if (!cert) { toast('Certificado não encontrado', 'err'); return }
        // Simula abertura em nova janela ou modal
        const win = window.open('', '_blank')
        win.document.write(`
            <html><head><title>Certificado ${cert.titulo}</title>
            <style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;background:#f0f0f0;margin:0;}
            .cert{background:#fff;padding:40px;border:4px solid var(--dourado);border-radius:12px;text-align:center;max-width:600px;}
            h1{color:var(--verde-escuro);} .data{color:#555;}</style></head>
            <body><div class="cert"><h1>${cert.titulo}</h1><p>Outorgado a <strong>${S.user.nome_completo}</strong></p>
            <p>NR ${cert.nr_id} · Emitido em ${new Date(cert.emitido_em).toLocaleDateString('pt-BR')}</p>
            <p class="data">Código: ${cert.id.slice(0,8)}</p>
            <p><i class="fas fa-check-circle" style="color:var(--verde);"></i> Certificado válido</p>
            <button onclick="window.print()">Imprimir</button></div></body></html>
        `)
        win.document.close()
    } catch (e) { toast('Erro ao visualizar', 'err') }
}

window.baixarCert = async function(id) {
    try {
        const { data: cert } = await sb.from('certificados').select('*').eq('id', id).single()
        if (!cert) { toast('Certificado não encontrado', 'err'); return }
        // Gera PDF simples (exemplo)
        const { jsPDF } = window.jspdf
        const doc = new jsPDF()
        doc.setFontSize(22)
        doc.text('Certificado SulSafe', 20, 30)
        doc.setFontSize(16)
        doc.text(`Título: ${cert.titulo}`, 20, 50)
        doc.text(`Nome: ${S.user.nome_completo}`, 20, 70)
        doc.text(`NR: ${cert.nr_id}`, 20, 90)
        doc.text(`Emitido em: ${new Date(cert.emitido_em).toLocaleDateString('pt-BR')}`, 20, 110)
        doc.text(`Código: ${cert.id.slice(0,8)}`, 20, 130)
        doc.save(`certificado_${cert.id.slice(0,8)}.pdf`)
    } catch (e) { toast('Erro ao baixar', 'err') }
}

window.revogarCert = async function(id) {
    if (!confirm('Tem certeza que deseja revogar este certificado?')) return
    try {
        await sb.from('certificados').update({ revogado: true }).eq('id', id)
        toast('Certificado revogado', 'info')
        carregarCertificados()
    } catch (e) { toast('Erro ao revogar', 'err') }
}
