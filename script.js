class DahiraPlatform {
    constructor() {
        this.init();
    }

    init() {
        this.membres = JSON.parse(localStorage.getItem('dahiraMembres') || '[]');
        this.recettes = JSON.parse(localStorage.getItem('dahiraRecettes') || '[]');
        this.depenses = JSON.parse(localStorage.getItem('dahiraDepenses') || '[]');
        this.cotisations = JSON.parse(localStorage.getItem('dahiraCotisations') || '[]');
        
        this.bindEvents();
        this.updateMembreSelect();
        this.loadStats();
        this.loadCotisationStats();
        this.renderMembres();
        this.renderRecettes();
        this.renderDepenses();
        this.switchTab('accueil');
    }

    renderMembres() {
        const tbody = document.querySelector('#membresTable tbody');
        tbody.innerHTML = this.membres.map(m => `
            <tr>
                <td>${m.prenom} ${m.nom}</td>
                <td>${m.telephone}</td>
                <td>${m.interets.join(', ') || 'Aucun'}</td>
                <td>${m.date}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="platform.editMembre(${m.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-delete" onclick="platform.deleteMembre(${m.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="5">Aucun membre</td></tr>';
        this.updateMembreSelect(); // Update select after membre change
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchTab(e.currentTarget.dataset.tab));
        });

        // Forms
        document.getElementById('inscriptionForm').addEventListener('submit', (e) => this.addMembre(e));
        document.getElementById('recetteForm').addEventListener('submit', (e) => this.addRecette(e));
        document.getElementById('depenseForm').addEventListener('submit', (e) => this.addDepense(e));
        document.getElementById('cotisationTenuesForm').addEventListener('submit', (e) => this.addCotisationTenues(e));
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        if (tabName === 'membres') this.renderMembres();
        if (tabName === 'recettes') this.renderRecettes();
        if (tabName === 'depenses') this.renderDepenses();
    }

    // Membres
    addMembre(e) {
        e.preventDefault();
        const nom = document.getElementById('nom').value.trim();
        const prenom = document.getElementById('prenom').value.trim();
        const telephone = document.getElementById('telephone').value.trim();
        const interets = Array.from(document.querySelectorAll('input[name="interets"]:checked')).map(cb => cb.value);

        if (!nom || !prenom || !telephone || !/^[0-9]{9}$/.test(telephone)) {
            alert('Vérifiez nom, prénom et téléphone (9 chiffres)');
            return;
        }

        const membre = {
            id: Date.now(),
            nom, prenom, telephone, interets,
            date: new Date().toLocaleString('fr-FR')
        };

        this.membres.unshift(membre);
        localStorage.setItem('dahiraMembres', JSON.stringify(this.membres));
        
        this.loadStats();
        this.renderMembres();
        e.target.reset();
        document.querySelectorAll('input[name="interets"]').forEach(cb => cb.checked = false);
        alert('Membre ajouté à la dahira !');
    }

    renderMembres() {
        const tbody = document.querySelector('#membresTable tbody');
        tbody.innerHTML = this.membres.map(m => `
            <tr>
                <td>${m.prenom} ${m.nom}</td>
                <td>${m.telephone}</td>
                <td>${m.interets.join(', ') || 'Aucun'}</td>
                <td>${m.date}</td>
                <td>
                    <button class="btn-small btn-edit" onclick="platform.editMembre(${m.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-delete" onclick="platform.deleteMembre(${m.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="5">Aucun membre</td></tr>';
    }

    deleteMembre(id) {
        if (confirm('Supprimer membre ?')) {
            this.membres = this.membres.filter(m => m.id !== id);
            localStorage.setItem('dahiraMembres', JSON.stringify(this.membres));
            this.loadStats();
            this.renderMembres();
        }
    }

    // Recettes
    addRecette(e) {
        e.preventDefault();
        const montant = parseFloat(document.getElementById('montantRecette').value);
        const description = document.getElementById('descRecette').value.trim();
        const date = document.getElementById('dateRecette').value || new Date().toISOString().split('T')[0];

        if (!montant || montant <= 0) {
            alert('Montant valide requis');
            return;
        }

        const recette = {
            id: Date.now(),
            montant, description, date,
            created: new Date().toLocaleString('fr-FR')
        };

        this.recettes.unshift(recette);
        localStorage.setItem('dahiraRecettes', JSON.stringify(this.recettes));
        
        this.loadStats();
        this.renderRecettes();
        e.target.reset();
        alert(`${montant} CFA ajouté !`);
    }

    renderRecettes() {
        const tbody = document.querySelector('#recettesTable tbody');
        tbody.innerHTML = this.recettes.map(r => `
            <tr>
                <td>${r.montant.toLocaleString()} CFA</td>
                <td>${r.description || '-'}</td>
                <td>${r.date}</td>
                <td>
                    <button class="btn-small btn-delete" onclick="platform.deleteRecette(${r.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="4">Aucune recette</td></tr>';
    }

    deleteRecette(id) {
        if (confirm('Supprimer recette ?')) {
            this.recettes = this.recettes.filter(r => r.id !== id);
            localStorage.setItem('dahiraRecettes', JSON.stringify(this.recettes));
            this.loadStats();
            this.renderRecettes();
        }
    }

    // Dépenses
    addDepense(e) {
        e.preventDefault();
        const montant = parseFloat(document.getElementById('montantDepense').value);
        const description = document.getElementById('descDepense').value.trim();
        const date = document.getElementById('dateDepense').value || new Date().toISOString().split('T')[0];

        if (!montant || montant <= 0) {
            alert('Montant valide requis');
            return;
        }

        const depense = {
            id: Date.now(),
            montant, description, date,
            created: new Date().toLocaleString('fr-FR')
        };

        this.depenses.unshift(depense);
        localStorage.setItem('dahiraDepenses', JSON.stringify(this.depenses));
        
        this.loadStats();
        this.renderDepenses();
        e.target.reset();
        alert(`${montant} CFA dépensé enregistré !`);
    }

    renderDepenses() {
        const tbody = document.querySelector('#depensesTable tbody');
        tbody.innerHTML = this.depenses.map(d => `
            <tr>
                <td>${d.montant.toLocaleString()} CFA</td>
                <td>${d.description || '-'}</td>
                <td>${d.date}</td>
                <td>
                    <button class="btn-small btn-delete" onclick="platform.deleteDepense(${d.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="4">Aucune dépense</td></tr>';
    }

    deleteDepense(id) {
        if (confirm('Supprimer dépense ?')) {
            this.depenses = this.depenses.filter(d => d.id !== id);
            localStorage.setItem('dahiraDepenses', JSON.stringify(this.depenses));
            this.loadStats();
            this.loadCotisationStats();
            this.renderDepenses();
        }
    }

    // Cotisations
    addCotisationTenues(e) {
        e.preventDefault();
        const membreSelect = document.getElementById('membreCotisation');
        const membreId = membreSelect.value;
        const membreNom = membreSelect.options[membreSelect.selectedIndex].text;
        const montant = parseFloat(document.getElementById('montantCotisation').value);
        const description = document.getElementById('descCotisation').value.trim();
        const date = document.getElementById('dateCotisation').value || new Date().toISOString().split('T')[0];

        if (!membreId || !montant || montant <= 0) {
            alert('Sélectionnez membre et montant valide');
            return;
        }

        const cotisation = {
            id: Date.now(),
            membreId: parseInt(membreId),
            membre: membreNom,
            type: 'tenues',
            montant, description, date,
            created: new Date().toLocaleString('fr-FR')
        };

        this.cotisations.unshift(cotisation);
        localStorage.setItem('dahiraCotisations', JSON.stringify(this.cotisations));
        
        this.loadStats();
        this.loadCotisationStats();
        e.target.reset();
        alert(`${membreNom} : ${montant} CFA cotisation ${cotisation.type} ajouté !`);
    }

    updateMembreSelect() {
        const select = document.getElementById('membreCotisation');
        if (select) {
            select.innerHTML = '<option value="">Sélectionner membre</option>' + this.membres.map(m => 
                `<option value="${m.id}">${m.prenom} ${m.nom}</option>`
            ).join('');
        }
    }

    // Ajout autres cotisations (futur)
    addCotisationAutres(e) {
        // À implémenter si form ajoutée
    }

    loadCotisationStats() {
        const totalTenues = this.cotisations.filter(c => c.type === 'tenues').reduce((sum, c) => sum + c.montant, 0);
        const totalAutres = this.cotisations.filter(c => c.type !== 'tenues').reduce((sum, c) => sum + c.montant, 0);

        document.getElementById('totalCotisationTenues').textContent = totalTenues.toLocaleString() + ' CFA';
        document.getElementById('totalAutresCotisations').textContent = totalAutres.toLocaleString() + ' CFA';

        // Rendu table cotisations
        const tbody = document.querySelector('#cotisationsTable tbody');
        if (tbody) {
            tbody.innerHTML = this.cotisations.map(c => `
                <tr>
                    <td>${c.type}</td>
                    <td>${c.montant.toLocaleString()} CFA</td>
                    <td>${c.description || '-'}</td>
                    <td>${c.membre || 'Anonyme'}</td>
                    <td>${c.date}</td>
                    <td>
                        <button class="btn-small btn-delete" onclick="platform.deleteCotisation(${c.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('') || '<tr><td colspan="6">Aucune cotisation</td></tr>';
        }
    }

    deleteCotisation(id) {
        if (confirm('Supprimer cotisation ?')) {
            this.cotisations = this.cotisations.filter(c => c.id !== id);
            localStorage.setItem('dahiraCotisations', JSON.stringify(this.cotisations));
            this.loadStats();
            this.loadCotisationStats();
        }
    }

    loadStats() {
        const totalMembres = this.membres.length;
        const totalRecettes = this.recettes.reduce((sum, r) => sum + r.montant, 0);
        const totalDepenses = this.depenses.reduce((sum, d) => sum + d.montant, 0);
        const solde = totalRecettes - totalDepenses;

        document.getElementById('totalMembres').textContent = totalMembres;
        document.getElementById('totalRecettes').textContent = totalRecettes.toLocaleString() + ' CFA';
        document.getElementById('totalDepenses').textContent = totalDepenses.toLocaleString() + ' CFA';
        
        const soldeEl = document.getElementById('solde');
        soldeEl.textContent = Math.abs(solde).toLocaleString() + ' CFA';
        soldeEl.className = solde >= 0 ? 'solde-positive' : 'solde-negative';
        soldeEl.parentElement.querySelector('i').className = solde >= 0 ? 'fas fa-balance-scale' : 'fas fa-exclamation-triangle';
    }
}

// Initialize platform
const platform = new DahiraPlatform();
