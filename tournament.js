const SUPABASE_URL = 'https://xgycsakujaopnbkgeuvg.supabase.co'; // Substitua pela URL do seu projeto
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneWNzYWt1amFvcG5ia2dldXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg4MTg4ODcsImV4cCI6MjAzNDM5NDg4N30.TkdIIO1_nD1XiH133jev1B4It2bcIRjIZRhgudQPBTw'; // Substitua pela chave pública (anon key) do seu projeto
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tournamentId = urlParams.get('id');

    if (tournamentId) {
        loadTournamentData(tournamentId);
    }

    async function loadTournamentData(tournamentId) {
        try {
            const { data: tournament, error } = await supabaseClient
                .from('tournaments')
                .select('*')
                .eq('id', tournamentId)
                .single();
            
            if (error) throw error;

            document.getElementById('tournamentName').textContent = tournament.tournament_name;

            generateMatches(tournament.participants);
            generateStandingsTable(tournament.participants);
        } catch (error) {
            console.error("Erro ao carregar dados do torneio:", error);
        }
    }

    function generateMatches(participants) {
        const matchesContainer = document.getElementById('matchesContainer');
        matchesContainer.innerHTML = '<h2>Confrontos</h2>';

        const matches = createMatches(participants);
        matches.forEach((match, index) => {
            const matchDiv = document.createElement('div');
            matchDiv.classList.add('match');
            matchDiv.innerHTML = `
                <p>Confronto ${index + 1}:</p>
                <p>${match.player1} vs ${match.player2}</p>
                <form id="matchForm${index}">
                    <label for="winner${index}">Vencedor:</label>
                    <select id="winner${index}" name="winner${index}">
                        <option value="">Selecione o vencedor</option>
                        <option value="${match.player1}">${match.player1}</option>
                        <option value="${match.player2}">${match.player2}</option>
                    </select>
                    <label for="pieces${index}">Peças finalizadas:</label>
                    <input type="number" id="pieces${index}" name="pieces${index}" min="0" max="4" required>
                    <button type="submit">Registrar Resultado</button>
                </form>
            `;
            matchDiv.querySelector(`#matchForm${index}`).addEventListener('submit', async function(event) {
                event.preventDefault();
                const formData = new FormData(matchDiv.querySelector(`#matchForm${index}`));
                const winner = formData.get(`winner${index}`);
                const pieces = parseInt(formData.get(`pieces${index}`));

                const updatedMatches = updateMatchResult(matches, index, winner, pieces);
                await updateTournamentMatches(updatedMatches);
            });
            matchesContainer.appendChild(matchDiv);
        });
    }

    function createMatches(participants) {
        const matches = [];
        for (let i = 0; i < participants.length; i += 2) {
            const player1 = participants[i];
            const player2 = participants[i + 1];
            matches.push({ player1, player2, winner: null, pieces: null });
        }
        return matches;
    }

    function updateMatchResult(matches, index, winner, pieces) {
        const updatedMatches = [...matches];
        updatedMatches[index].winner = winner;
        updatedMatches[index].pieces = pieces;
        return updatedMatches;
    }

    async function updateTournamentMatches(updatedMatches) {
        try {
            const tournamentId = urlParams.get('id');
            const { data, error } = await supabaseClient
                .from('tournaments')
                .update({ matches: updatedMatches })
                .eq('id', tournamentId);

            if (error) throw error;

            console.log("Resultado do confronto registrado com sucesso:", data);
            // Atualizar a exibição dos confrontos (opcional)
        } catch (error) {
            console.error("Erro ao registrar resultado do confronto:", error);
        }
    }

    function generateStandingsTable(participants) {
        const standingsContainer = document.getElementById('standingsContainer');
        standingsContainer.innerHTML = '<h2>Tabela de Classificação</h2>';

        // Ordenar participantes com base nas peças finalizadas
        participants.sort((a, b) => b.total_pieces - a.total_pieces);

        const table = document.createElement('table');
        table.innerHTML = `
            <tr>
                <th>Posição</th>
                <th>Participante</th>
                <th>Peças Finalizadas</th>
            </tr>
        `;
        
        participants.forEach((participant, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${participant}</td>
                <td>${participant.total_pieces}</td>
            `;
            table.appendChild(row);
        });

        standingsContainer.appendChild(table);
    }
});
