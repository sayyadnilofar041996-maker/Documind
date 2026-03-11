"""
DocuMind - rag/chain.py
Purpose : RAG chain — context assembly, prompt building, answer generation
Phase   : 5
"""
# ============================================================
# PLACEHOLDER — implementation added in Phase 5
# ============================================================
# - run_rag_chain(question, user_id, doc_id=None, history=[])
#   → dict {answer, sources, latency_ms, prompt_tokens}
# - Embeds question → retriever.retrieve_chunks()
# - Formats context as [Source: file.pdf | Page N] blocks
# - Injects last N conversation pairs as history
# - Calls groq_client.generate_answer(prompt)
# System prompt: answer ONLY from context, cite sources inline,
#               say "not found" if answer not in documents
# ============================================================

pass
