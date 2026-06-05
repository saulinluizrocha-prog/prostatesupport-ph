const crypto = require('crypto');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const body = req.body || {};
    const name = body.name;
    const phone = body.phone;

    if (!name || !phone) {
        // Redireciona de volta se os dados forem inválidos
        const referer = req.headers.referer || '/';
        return res.redirect(302, referer);
    }

    try {
        const apiKey = 'c66289394c2a6e8515c8e8b382fba719';
        const userId = '75329';
        const offerId = '6810';
        const streamId = 've5s';

        // Obter os parâmetros de consulta da URL da requisição
        const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const query = Object.fromEntries(urlObj.searchParams.entries());

        const data = {
            name: name.trim(),
            phone: phone.trim(),
            region: body.region || null,
            city: body.city || null,
            count: body.count || null,
            offer_id: offerId,
            stream_id: streamId,
            country: 'PH',
            tz: body.tz || '',
            address: body.address || null,
            email: body.email || null,
            zip: body.zip || null,
            user_comment: body.user_comment || null,
            referer: query.referer || req.headers.referer || null,
            utm_source: query.utm_source || null,
            utm_medium: query.utm_medium || null,
            utm_campaign: query.utm_campaign || null,
            utm_term: query.utm_term || null,
            utm_content: query.utm_content || null,
            sub_id: query.sub_id || null,
            sub_id_1: query.sub_id_1 || null,
            sub_id_2: query.sub_id_2 || null,
            sub_id_3: query.sub_id_3 || null,
            sub_id_4: query.sub_id_4 || null,
        };

        const postData = {
            user_id: userId,
            data: data
        };

        const jsonData = JSON.stringify(postData);

        // Calcular check_sum: sha1(jsonData + apiKey)
        const shasum = crypto.createHash('sha1');
        shasum.update(jsonData + apiKey);
        const checkSum = shasum.digest('hex');

        const apiUrl = `https://t-api.org/api/lead/create?check_sum=${checkSum}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`A API respondeu com status ${response.status}: ${errText}`);
        }

        const resData = await response.json();

        if (resData.status === 'ok') {
            const leadId = resData.data.id;
            return res.redirect(302, `/success.html?id=${leadId}`);
        } else {
            throw new Error(resData.error || 'Erro desconhecido da API');
        }

    } catch (error) {
        console.error('Erro ao enviar lead:', error);
        return res.status(500).send(`Erro interno: ${error.message}`);
    }
};
