// ============================================================
// VIEW: CERTIFICADOS (Aluno / Admin)
// ============================================================
import { S, role, uid, nav, fmtD } from '../state.js'
import { sbGetCertificadosAluno, sbEmitirCertificado, sbGetAlunos, sbGetNotasAluno } from '../supabase-client.js'
import { toast, handleError, $, $$, NRS } from '../utils.js'

export function vCerts() {
    const r = role()
    let h = `<div class="btn-back" onclick="window.nav('inicio')"><i class="fas fa-arrow-left"></i> Voltar</div>`
    h += `<h2 class="wc">Certificados</h2>`
    
    if (r === 'aluno') {
        h += `<div id="certsAluno"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando...</p></div></div>`
        setTimeout(carregarCertsAluno, 200)
    } else {
        h += `<div id="certsAdmin"><div class="empty"><i class="fas fa-spinner fa-spin"></i><p>Carregando...</p></div></div>`
        setTimeout(carregarCertsAdmin, 200)
    }
    return h
}

async function carregarCertsAluno() {
    const container = document.getElementById('certsAluno')
    if (!container) return
    const { data: certs } = await sbGetCertificadosAluno(uid())
    
    let h = `<p class="wcs">Certificados emitidos para você.</p>`
    if (!certs || certs.length === 0) {
        h += `<div class="empty"><i class="fas fa-certificate"></i><p>Nenhum certificado emitido.</p></div>`
    } else {
        h += `<div class="tw"><table><thead><tr><th>NR</th><th>Nota</th><th>Código</th><th>Emitido em</th><th>Ação</th></tr></thead><tbody>`
        certs.forEach(c => { h += `<tr><td><strong>NR ${c.nr_id}</strong></td><td>${c.nota ?? '—'}</td><td><code style="background:var(--ip);padding:2px 8px;border-radius:4px;font-size:11px">${c.codigo}</code></td><td>${fmtD(c.criado_em)}</td><td><button class="btn btn-sm btn-p" onclick="dlCert('${c.id}')"><i class="fas fa-download"></i> PDF</button></td></tr>` })
        h += `</tbody></table></div>`
    }
    container.innerHTML = h
}

async function carregarCertsAdmin() {
    const container = document.getElementById('certsAdmin')
    if (!container) return
    const { data: alunos } = await sbGetAlunos()
    const { data: certs } = await sb.from('certificados').select('*, profiles(nome_completo)').order('criado_em', { ascending: false })
    
    let h = `<p class="wcs">Emita certificados para alunos.</p>`
    h += `<div class="pnl"><div class="pnl-h"><div class="pnl-t"><i class="fas fa-certificate"></i> Emitir Novo</div></div>
        <div class="fld"><label>Aluno</label><select id="cAluno" class="search" style="margin:0;border-radius:var(--r)"><option value="">Selecione...</option>${alunos.map(a => `<option value="${a.id}">${a.nome_completo}</option>`).join('')}</select></div>
        <div class="fld"><label>NR</label><select id="cNR" class="search" style="margin:0;border-radius:var(--r)"><option value="">Selecione...</option>${NRS.map(n => `<option value="${n.id}">NR ${n.id} — ${n.nm}</option>`).join('')}</select></div>
        <div class="fld"><label>Carga Horária</label><input type="number" id="cCH" value="40" min="1" max="999" class="search" style="margin:0;border-radius:var(--r)"></div>
        <button class="btn btn-g" onclick="emitCert()"><i class="fas fa-award"></i> Emitir Certificado</button>
    </div>`
    h += `<div class="pnl"><div class="pnl-h"><div class="pnl-t"><i class="fas fa-list"></i> Emitidos (${certs?.length || 0})</div></div>`
    if (!certs || certs.length === 0) {
        h += `<div class="empty" style="padding:30px"><p>Nenhum certificado emitido.</p></div>`
    } else {
        h += `<div class="tw"><table><thead><tr><th>Aluno</th><th>NR</th><th>Código</th><th>Ações</th></tr></thead><tbody>`
        certs.forEach(c => { h += `<tr><td>${c.profiles?.nome_completo || '—'}</td><td>NR ${c.nr_id}</td><td><code style="background:var(--ip);padding:2px 8px;border-radius:4px;font-size:11px">${c.codigo}</code></td><td><button class="btn btn-sm btn-s" onclick="dlCert('${c.id}')"><i class="fas fa-download"></i></button> <button class="btn btn-sm btn-d" onclick="delCert('${c.id}')"><i class="fas fa-trash"></i></button></td></tr>` })
        h += `</tbody></table></div>`
    }
    h += `</div>`
    container.innerHTML = h
}

async function emitCert() {
    const aid = $('#cAluno')?.value, nrid = $('#cNR')?.value, ch = parseInt($('#cCH')?.value) || 40
    if (!aid || !nrid) { toast('Selecione aluno e NR', 'err'); return }
    const { data: notas } = await sbGetNotasAluno(aid)
    const notaEntry = notas?.find(n => n.nr_id === nrid)
    const { data, error } = await sbEmitirCertificado(aid, nrid, notaEntry?.nota, ch)
    if (error) { handleError(error); return }
    toast('Certificado emitido!', 'success')
    pushNotif(`Certificado emitido para NR ${nrid}!`, 'Ver certificado', 'certificados')
    carregarCertsAdmin()
}

async function delCert(id) {
    if (!confirm('Excluir?')) return
    await sb.from('certificados').delete().eq('id', id)
    toast('Excluído', 'info')
    carregarCertsAdmin()
}

async function dlCert(id) {
    const { data: certs } = await sb.from('certificados').select('*, profiles(*)').eq('id', id)
    const c = certs?.[0]
    if (!c) return
    const al = c.profiles
    const nr = NRS.find(n => n.id === c.nr_id)
    const de = new Date(c.criado_em)
    try {
        const { jsPDF } = window.jspdf
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
        doc.setFillColor(255, 255, 255); doc.rect(0, 0, 297, 210, 'F')
        doc.setDrawColor(46, 125, 50); doc.setLineWidth(4); doc.rect(6, 6, 285, 198)
        doc.setDrawColor(201, 176, 55); doc.setLineWidth(1.5); doc.rect(10, 10, 277, 190)
        doc.setDrawColor(46, 125, 50); doc.setLineWidth(0.3); doc.rect(13, 13, 271, 184)
        doc.setFillColor(46, 125, 50); doc.roundedRect(18, 18, 45, 45, 8, 8, 'F')
        doc.setTextColor(255, 255, 255); doc.setFontSize(24); doc.setFont('helvetica', 'bold')
        doc.text('SS', 40.5, 46, { align: 'center' }); doc.setFontSize(7); doc.text('SULSAFE', 40.5, 52, { align: 'center' })
        doc.setFillColor(201, 176, 55); doc.roundedRect(230, 18, 48, 16, 4, 4, 'F')
        doc.setTextColor(26, 26, 26); doc.setFontSize(8); doc.setFont('helvetica', 'bold')
        doc.text('VÁLIDO DIGITALMENTE', 254, 29, { align: 'center' })
        doc.setTextColor(46, 125, 50); doc.setFontSize(36); doc.setFont('helvetica', 'bold')
        doc.text('CERTIFICADO', 148.5, 50, { align: 'center' })
        doc.setDrawColor(201, 176, 55); doc.setLineWidth(1); doc.line(80, 55, 217, 55)
        doc.setTextColor(80, 80, 80); doc.setFontSize(12); doc.setFont('helvetica', 'normal')
        doc.text('Certificamos que', 148.5, 70, { align: 'center' })
        doc.setTextColor(26, 26, 26); doc.setFontSize(28); doc.setFont('helvetica', 'bold')
        const nome = al?.nome_completo || 'Nome do Aluno'
        doc.text(nome, 148.5, 88, { align: 'center' })
        const nw = doc.getTextWidth(nome); doc.setDrawColor(46, 125, 50); doc.setLineWidth(0.5)
        doc.line(148.5 - nw / 2 - 5, 90, 148.5 + nw / 2 + 5, 90)
        doc.setTextColor(60, 60, 60); doc.setFontSize(12)
        doc.text(`concluiu com êxito o curso da NR ${c.nr_id} — ${nr?.nm || ''}`, 148.5, 105, { align: 'center' })
        doc.text(`com carga horária de ${c.carga_horaria} horas`, 148.5, 114, { align: 'center' })
        if (c.nota != null) doc.text(`obtendo nota final: ${c.nota}/10,0`, 148.5, 123, { align: 'center' })
        doc.setFontSize(10); doc.setTextColor(100, 100, 100)
        doc.text(`Emitido em: ${de.toLocaleDateString('pt-BR')} às ${de.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 148.5, 140, { align: 'center' })
        doc.setFillColor(244, 247, 246); doc.roundedRect(108, 146, 81, 14, 4, 4, 'F')
        doc.setTextColor(46, 125, 50); doc.setFontSize(8); doc.setFont('helvetica', 'bold')
        doc.text(`VERIFICAÇÃO: ${c.codigo}`, 148.5, 155, { align: 'center' })
        doc.setDrawColor(46, 125, 50); doc.setLineWidth(0.5); doc.line(90, 175, 170, 175)
        doc.setTextColor(80, 80, 80); doc.setFontSize(10)
        doc.text((S.user?.nome_completo || 'Administrador SulSafe'), 130, 182, { align: 'center' })
        doc.setFontSize(8); doc.setTextColor(120, 120, 120)
        doc.text(`${S.user?.email || 'sulsafetreinamentos@gmail.com'}`, 130, 188, { align: 'center' })
        doc.text('SulSafe Treinamentos — Segurança do Trabalho', 130, 194, { align: 'center' })
        doc.setFontSize(7); doc.setTextColor(180, 180, 180)
        doc.text('Documento gerado pela plataforma SulSafe. Verifique a autenticidade em sulsafe.com.br/verificar', 148.5, 206, { align: 'center' })
        doc.save(`Certificado-NR${c.nr_id}-${nome.replace(/\s+/g, '-')}.pdf`)
        toast('PDF gerado!', 'success')
    } catch (e) { toast('Erro ao gerar PDF: ' + e.message, 'err') }
}

window.emitCert = emitCert
window.delCert = delCert
window.dlCert = dlCert
