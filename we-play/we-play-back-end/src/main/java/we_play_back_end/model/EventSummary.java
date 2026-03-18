package we_play_back_end.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class EventSummary {
    private String id;
    private String name;
    private String sport;
    private String location;
    private LocalDate startDate;
    private String format;
}