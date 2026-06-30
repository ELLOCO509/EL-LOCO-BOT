import stylizedChar from "../utils/fancy.js";
import yts from "yt-search";
import ytdl from "@distube/ytdl-core";

export async function play(message, client) {
    const remoteJid = message.key.remoteJid;
    const rawText =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        "";

    const query = rawText.split(/\s+/).slice(1).join(" ").trim();

    try {
        if (!query) {
            return await client.sendMessage(remoteJid, {
                text: stylizedChar("❌ Fournis le nom d'une musique.\n\nExemple : .play Blue Bird"),
                quoted: message
            });
        }

        await client.sendMessage(remoteJid, {
            text: stylizedChar(`🔎 Recherche de "${query}"...`),
            quoted: message
        });

        const search = await yts(query);

        if (!search.videos.length) {
            return await client.sendMessage(remoteJid, {
                text: stylizedChar("❌ Aucune musique trouvée."),
                quoted: message
            });
        }

        const video = search.videos[0];

        await client.sendMessage(remoteJid, {
            image: { url: video.thumbnail },
            caption:
`🎵 *${video.title}*

⏱️ Durée : ${video.timestamp}
👁️ Vues : ${video.views.toLocaleString()}
👤 Auteur : ${video.author.name}

© EL LOCO BOT`,
            quoted: message
        });

        const stream = ytdl(video.url, {
            quality: "highestaudio",
            filter: "audioonly"
        });

        await client.sendMessage(remoteJid, {
            audio: stream,
            mimetype: "audio/mp4",
            ptt: false,
            quoted: message
        });

        console.log("✅ Audio envoyé :", video.title);

    } catch (err) {
        console.error(err);

        await client.sendMessage(remoteJid, {
            text: stylizedChar(
                "❌ Impossible de télécharger cette musique.\nRéessaie dans quelques instants."
            ),
            quoted: message
        });
    }
}

export default play;