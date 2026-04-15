from litellm import completion


def llm_req(messages: list[dict]):
    try:
        response = completion(
            model="hosted_vllm/qwen3-8b",
            messages=messages,
            base_url="http://localhost:8000/v1",
            api_key="EMPTY",
            temperature=0.7,
            max_tokens=512,
        )
        return response.choices[0].message.content

    except Exception as e:
        print(f"Ошибка при синхронном запросе: {e}")
        raise
