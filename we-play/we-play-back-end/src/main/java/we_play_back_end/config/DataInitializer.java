package we_play_back_end.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import we_play_back_end.model.Role;
import we_play_back_end.model.ActivityLocation;
import we_play_back_end.repository.RoleRepository;
import we_play_back_end.repository.ActivityLocationRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final ActivityLocationRepository locationRepository;

    public DataInitializer(RoleRepository roleRepository, ActivityLocationRepository locationRepository) {
        this.roleRepository = roleRepository;
        this.locationRepository = locationRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ensure basic roles exist
        for (Role.ERole r : Role.ERole.values()) {
            roleRepository.findByName(r).orElseGet(() -> roleRepository.save(new Role(null, r)));
        }

        // Seed sample activity locations if none exist
        if (locationRepository.count() == 0) {
            seedActivityLocations();
        }
    }

    private void seedActivityLocations() {
        // Sample locations for MVP demonstration
        ActivityLocation loc1 = new ActivityLocation();
        loc1.setName("Downtown Basketball Courts");
        loc1.setAddress("123 Main Street, Downtown");
        loc1.setSport("Basketball");
        loc1.setCoordinates(new double[]{-73.985428, 40.748817}); // NYC area
        loc1.setActivityLevel(75);
        loc1.setCurrentUsers(8);
        loc1.setHeadingUsers(3);
        loc1.setLocationType("court");
        loc1.setActive(true);
        locationRepository.save(loc1);

        ActivityLocation loc2 = new ActivityLocation();
        loc2.setName("Riverside Soccer Field");
        loc2.setAddress("456 River Road, Riverside");
        loc2.setSport("Soccer");
        loc2.setCoordinates(new double[]{-73.970000, 40.760000});
        loc2.setActivityLevel(50);
        loc2.setCurrentUsers(12);
        loc2.setHeadingUsers(5);
        loc2.setLocationType("field");
        loc2.setActive(true);
        locationRepository.save(loc2);

        ActivityLocation loc3 = new ActivityLocation();
        loc3.setName("West Side Boxing Gym");
        loc3.setAddress("789 West Ave, Midtown");
        loc3.setSport("Boxing");
        loc3.setCoordinates(new double[]{-73.990000, 40.755000});
        loc3.setActivityLevel(40);
        loc3.setCurrentUsers(6);
        loc3.setHeadingUsers(2);
        loc3.setLocationType("gym");
        loc3.setActive(true);
        locationRepository.save(loc3);

        ActivityLocation loc4 = new ActivityLocation();
        loc4.setName("Central Park Tennis Courts");
        loc4.setAddress("Central Park, East Side");
        loc4.setSport("Tennis");
        loc4.setCoordinates(new double[]{-73.965000, 40.785000});
        loc4.setActivityLevel(60);
        loc4.setCurrentUsers(4);
        loc4.setHeadingUsers(1);
        loc4.setLocationType("court");
        loc4.setActive(true);
        locationRepository.save(loc4);

        ActivityLocation loc5 = new ActivityLocation();
        loc5.setName("Community Sports Complex");
        loc5.setAddress("100 Community Blvd");
        loc5.setSport("Mixed");
        loc5.setCoordinates(new double[]{-73.950000, 40.770000});
        loc5.setActivityLevel(85);
        loc5.setCurrentUsers(25);
        loc5.setHeadingUsers(10);
        loc5.setLocationType("arena");
        loc5.setActive(true);
        locationRepository.save(loc5);
    }
}
