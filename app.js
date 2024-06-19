document.addEventListener('DOMContentLoaded', function() {
    const SUPABASE_URL = 'https://xgycsakujaopnbkgeuvg.supabase.co'; // Substitua pela URL do seu projeto
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneWNzYWt1amFvcG5ia2dldXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4MTg4ODcsImV4cCI6MjAzNDM5NDg4N30.TkdIIO1_nD1XiH133jev1B4It2bcIRjIZRhgudQPBTw'; // Substitua pela chave pública (anon key) do seu projeto
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const tournamentForm = document.getElementById('tournamentForm');
    const participantsContainer = document.getElementById('participantsContainer');
    const participantsCountInput = document.getElementById('participantsCount');

    participantsCountInput.addEventListener('input', function() {
        const count = parseInt(participantsCountInput.value);
        participantsContainer.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            const participantLabel = document.createElement('label');
            participantLabel.setAttribute('for', `participant${i}`);
            participantLabel.textContent = `Nome do Participante ${i}:`;

            const participantInput = document.createElement('input');
            participantInput.setAttribute('type', 'text');
            participantInput.setAttribute('id', `participant${i}`);
            participantInput.setAttribute('name', `participant${i}`);
            participantInput.setAttribute('required', true);

            participantsContainer.appendChild(participantLabel);
            participantsContainer.appendChild(participantInput);
        }
    });

    tournamentForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const formData = new FormData(tournamentForm);
        const tournamentData = {
            tournament_name: formData.get('tournamentName'),
            participants_count: parseInt(formData.get('participantsCount')),
            admin_name: formData.get('adminName'),
            participants: []
        };
        for (let i = 1; i <= tournamentData.participants_count; i++) {
            tournamentData.participants.push(formData.get(`participant${i}`));
        }

        try {
            const { data, error } = await supabaseClient
                .from('tournaments')
                .insert([tournamentData]);

            if (error) throw error;

            console.log("Torneio cadastrado com sucesso:", data);
            if (data && data.length > 0) {
                window.location.href = `tournament.html?id=${data[0].id}`;
            }
        } catch (error) {
            console.error("Erro ao cadastrar torneio:", error);
        }
    });

    async function loadExistingTournaments() {
        try {
            const { data: tournaments, error } = await supabaseClient
                .from('tournaments')
                .select('*');
            
            if (error) throw error;

            const existingTournaments = document.getElementById('existingTournaments');
            existingTournaments.innerHTML = '<h2>Torneios Existentes</h2>';
            tournaments.forEach(tournament => {
                const tournamentDiv = document.createElement('div');
                tournamentDiv.textContent = tournament.tournament_name;
                const joinButton = document.createElement('button');
                joinButton.textContent = 'Entrar';
                joinButton.addEventListener('click', () => {
                    window.location.href = `tournament.html?id=${tournament.id}`;
                });
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.addEventListener('click', async () => {
                    await supabaseClient
                        .from('tournaments')
                        .delete()
                        .eq('id', tournament.id);
                    loadExistingTournaments();
                });
                tournamentDiv.appendChild(joinButton);
                tournamentDiv.appendChild(deleteButton);
                existingTournaments.appendChild(tournamentDiv);
            });
        } catch (error) {
            console.error("Erro ao carregar torneios existentes:", error);
        }
    }

    loadExistingTournaments();
});
