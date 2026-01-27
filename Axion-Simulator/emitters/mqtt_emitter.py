# emitters/mqtt_emitter.py

from core.telemetry_builder import build_message


class MqttEmitter:
    def __init__(self, mqtt_client, topic_template: str):
        self.client = mqtt_client
        self.topic_template = topic_template

    async def emit(self, state):
        topic = self.topic_template.format(vehicle_id=state.vehicle_id)
        payload = build_message(state)
        self.client.publish(topic, payload)
