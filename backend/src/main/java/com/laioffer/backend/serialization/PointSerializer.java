package com.laioffer.backend.serialization;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import org.locationtech.jts.geom.Point;
import java.io.IOException;

public class PointSerializer extends StdSerializer<Point> {

    public PointSerializer() {
        super(Point.class);
    }

    @Override
    public void serialize(Point value, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeStartObject();
        gen.writeStringField("type", "Point");
        gen.writeFieldName("coordinates");
        gen.writeStartArray();
        gen.writeNumber(value.getX());
        gen.writeNumber(value.getY());
        gen.writeEndArray();
        gen.writeEndObject();
    }
}