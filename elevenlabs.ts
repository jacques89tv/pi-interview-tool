import type { QuestionsFile } from "./schema.js";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

function buildQuestionList(questions: QuestionsFile): string {
	return questions.questions
		.map((q, index) => {
			const lines = [
				`${index + 1}. [ID: ${q.id}] ${q.question}`,
				`   Type: ${q.type}`,
			];
			if (q.options && q.options.length > 0) {
				lines.push(`   Options: ${q.options.join(", ")}`);
			}
			return lines.join("\n");
		})
		.join("\n");
}

export function buildSystemPrompt(questions: QuestionsFile): string {
	const closing = questions.voice?.closing;
	return [
		`You are conducting a structured interview with ${questions.questions.length} questions.`,
		"",
		"ADAPTIVE BEHAVIORS:",
		"1. When you receive a [USER_NAVIGATION] event, immediately pivot to that question.",
		'   Acknowledge briefly: "Let\'s look at question X" then read it.',
		"",
		"2. After capturing an answer, check remaining unanswered questions before proceeding.",
		"   The system will tell you which questions still need answers.",
		"",
		"3. If a question already has an answer when you reach it, acknowledge it:",
		'   "I see you\'ve already answered this with [answer]. Want to change it or move on?"',
		"",
		"4. Smart transitions between questions:",
		'   - If jumping non-sequentially, briefly orient: "Now let\'s jump to question 7..."',
		'   - If sequential, simple transition: "Next question..."',
		"",
		'5. Handle "go back" by returning to the previous discussed question.',
		"",
		"6. When all questions are answered, summarize briefly and conclude.",
		closing ? `   Closing line: "${closing}"` : "",
		"",
		"IMAGE QUESTIONS:",
		'Questions marked as type "image" cannot be answered by voice. When you reach one, say:',
		'"Question X requires an image upload. Please use the form directly for this one. Moving on to the next question."',
		"",
		"QUESTION LIST:",
		buildQuestionList(questions),
		"",
		"You will receive system messages in brackets like [USER_NAVIGATION: q5] or",
		"[FORM_STATE: q1=answered, q2=unanswered, ...]. Use these to stay synchronized.",
	]
		.filter(Boolean)
		.join("\n");
}

export async function createVoiceAgent(options: {
	apiKey: string;
	questions: QuestionsFile;
	sessionId: string;
}): Promise<{ agentId: string; signedUrl: string }> {
	const { apiKey, questions, sessionId } = options;
	const prompt = buildSystemPrompt(questions);
	const greeting = questions.voice?.greeting || "Let's begin the interview.";
	const name = questions.title ? `Interview: ${questions.title}` : `Interview ${sessionId.slice(0, 8)}`;

	const createResponse = await fetch(`${ELEVENLABS_API_BASE}/convai/agents/create`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"xi-api-key": apiKey,
		},
		body: JSON.stringify({
			name,
			conversation_config: {
				agent: {
					prompt: { prompt },
					first_message: greeting,
				},
			},
		}),
	});

	if (!createResponse.ok) {
		const errorText = await createResponse.text().catch(() => "");
		throw new Error(`ElevenLabs agent create failed (${createResponse.status}). ${errorText}`.trim());
	}

	const createData = (await createResponse.json().catch(() => ({}))) as {
		agent_id?: string;
		agentId?: string;
	};
	const agentId = createData.agent_id || createData.agentId;
	if (!agentId) {
		throw new Error("ElevenLabs agent create failed: missing agent_id");
	}

	const signedUrlResponse = await fetch(
		`${ELEVENLABS_API_BASE}/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
		{
			headers: { "xi-api-key": apiKey },
		}
	);

	if (signedUrlResponse.ok) {
		const signedData = (await signedUrlResponse.json().catch(() => ({}))) as {
			signed_url?: string;
			signedUrl?: string;
		};
		const signedUrl = signedData.signed_url || signedData.signedUrl;
		if (signedUrl) {
			return { agentId, signedUrl };
		}
	}

	const fallbackUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${encodeURIComponent(agentId)}`;
	return { agentId, signedUrl: fallbackUrl };
}
