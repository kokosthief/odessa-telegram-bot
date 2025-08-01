# Product Requirements Prompt (PRP) - Enhanced /whosplaying Command with Wix CMS Integration

## Project Overview

**Project Name**: Odessa Telegram Bot - Enhanced /whosplaying Command with Wix CMS Integration  
**Technology Stack**: Node.js, TypeScript, Telegram Bot API, Wix Data API  
**Primary Goal**: Enhance the `/whosplaying` command to include DJ photos and descriptions from Wix CMS

## Context Analysis

### Current State
- `/whosplaying` command shows today's events with basic DJ information
- DJ data is stored in local JSON file (`src/data/djs.json`)
- Only includes SoundCloud/MixCloud links
- No photos or detailed descriptions
- Basic formatting with event type and DJ name

### Target State
- Enhanced `/whosplaying` command with DJ photos from Wix CMS
- Rich DJ descriptions from Wix CMS
- Fallback to existing JSON data if Wix data unavailable
- Improved user experience with visual content
- Maintain existing functionality while adding new features

## Technical Requirements

### Core Components

1. **Wix Data API Integration**
   - Connect to Wix Data API using provided credentials
   - Query "Musical Facilitators" collection
   - Map DJ names from Hipsy to Wix CMS data
   - Handle API rate limiting and error scenarios

2. **DJ Data Enhancement**
   - Extend existing DJ data structure to include photos and descriptions
   - Implement fallback mechanism to existing JSON data
   - Cache Wix data for performance optimization
   - Handle missing or incomplete Wix data gracefully

3. **Enhanced Message Formatting**
   - Include DJ photos in Telegram messages
   - Add rich descriptions for each DJ
   - Maintain existing ticket booking functionality
   - Support both single and multiple event scenarios

4. **Error Handling & Fallbacks**
   - Graceful handling of Wix API failures
   - Fallback to existing JSON-based DJ data
   - User-friendly error messages
   - Logging for debugging and monitoring

### Data Flow

```
Hipsy Event → DJ Name Extraction → Wix CMS Lookup → Photo + Description → Enhanced Message → Telegram
```

## Implementation Plan

### Phase 1: Wix API Integration
- [ ] Create Wix Data API client module
- [ ] Implement authentication with provided API key
- [ ] Query "Musical Facilitators" collection
- [ ] Map DJ names between Hipsy and Wix data
- [ ] Add error handling and rate limiting

### Phase 2: Enhanced DJ Data Structure
- [ ] Extend DJ interface to include photo and description fields
- [ ] Create Wix DJ data loader module
- [ ] Implement caching for Wix data
- [ ] Add fallback mechanism to existing JSON data
- [ ] Update DJ loader to prioritize Wix data

### Phase 3: Enhanced Message Formatting
- [ ] Update `formatTodaySchedule` to include photos
- [ ] Add rich descriptions to event messages
- [ ] Handle photo uploads to Telegram
- [ ] Maintain existing keyboard functionality
- [ ] Test with various DJ data scenarios

### Phase 4: Testing and Validation
- [ ] Unit tests for Wix API integration
- [ ] Integration tests for enhanced command
- [ ] Error scenario testing
- [ ] Performance testing with caching

## Success Criteria

### Functional Requirements
- [ ] Enhanced `/whosplaying` command includes DJ photos
- [ ] Rich DJ descriptions included in messages
- [ ] Fallback to existing JSON data when Wix unavailable
- [ ] Maintains existing ticket booking functionality
- [ ] Handles missing DJ data gracefully

### Non-Functional Requirements
- [ ] Response time under 10 seconds for enhanced command
- [ ] Wix API calls properly rate limited
- [ ] Comprehensive error handling and logging
- [ ] Graceful degradation when Wix data unavailable

### Quality Gates
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] No breaking changes to existing functionality
- [ ] Performance benchmarks met

## Risk Assessment

### High Risk
- **Wix API Reliability**: API could be unavailable or change
- **Photo Upload Limits**: Telegram has file size and rate limits
- **Data Mapping**: DJ names might not match between Hipsy and Wix

### Medium Risk
- **Performance**: Photo uploads could slow down responses
- **Caching**: Need to balance freshness with performance
- **Error Handling**: Complex fallback scenarios

### Mitigation Strategies
- Implement robust error handling and fallbacks
- Cache Wix data appropriately
- Use existing JSON data as reliable fallback
- Monitor and alert on Wix API failures

## Validation Commands

### Development Validation
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests
npm run test

# Integration tests
npm run test:integration
```

### Runtime Validation
```bash
# Test enhanced command
npm run test:commands

# Test Wix API integration
npm run test:wix-integration

# End-to-end test
npm run test:e2e
```

## Dependencies

### External Dependencies
- **Wix Data API**: For DJ photos and descriptions
- **Telegram Bot API**: For photo uploads and enhanced messages
- **Existing DJ Loader**: For fallback data

### Internal Dependencies
- **Configuration**: Environment variables for Wix API
- **Logging**: Enhanced logging for Wix integration
- **Error Handling**: Custom error types for Wix failures

## Monitoring and Observability

### Key Metrics
- Wix API response times and success rates
- Photo upload success rates
- Enhanced command usage frequency
- Fallback usage frequency
- Error rates and types

### Logging Requirements
- Structured logging for Wix API calls
- Photo upload success/failure tracking
- DJ data mapping success rates
- Performance metrics for enhanced command

### Alerting
- High Wix API error rates (>5%)
- Photo upload failures
- Enhanced command generation failures
- Fallback usage spikes

## Security Considerations

### Data Protection
- Secure storage of Wix API credentials
- Validate all URLs before posting to Telegram
- Sanitize DJ descriptions before posting
- Rate limiting for Wix API calls

### Access Control
- Minimal required permissions for Wix API
- Secure environment variable management
- Audit logging for Wix data access
- Proper error message sanitization

## Implementation Details

### Wix API Integration Pattern
```typescript
// Example Wix API integration pattern
class WixDJLoader {
  async getDJInfo(djName: string): Promise<WixDJData | null> {
    try {
      const response = await this.wixClient.query({
        collectionId: 'Musical Facilitators',
        filter: { name: djName }
      });
      
      return this.mapWixDataToDJ(response.data);
    } catch (error) {
      logger.error('Wix API error:', error);
      return null;
    }
  }
}
```

### Enhanced DJ Data Structure
```typescript
interface EnhancedDJ {
  name: string;
  photo?: string;
  shortDescription?: string;
  longDescription?: string;
  soundcloudUrl?: string;
  instagramUrl?: string;
  website?: string;
  email?: string;
}
```

### Enhanced Message Formatting
```typescript
// Example enhanced message formatting
async function formatEnhancedTodaySchedule(events: Event[]): Promise<{ text: string; photos?: string[]; keyboard?: any }> {
  const enhancedEvents = await Promise.all(events.map(async (event) => {
    const djData = await getEnhancedDJData(event.djName);
    return {
      ...event,
      djPhoto: djData?.photo,
      djDescription: djData?.shortDescription
    };
  }));
  
  return formatEventsWithPhotos(enhancedEvents);
}
```

## Future Enhancements

### Potential Improvements
- Multiple photo support for DJs
- Rich media galleries
- DJ social media integration
- Advanced caching strategies
- Analytics for DJ engagement

### Scalability Considerations
- CDN integration for photo storage
- Database migration for DJ data
- Advanced caching for Wix data
- Load balancing for high command volume

## Environment Variables

### Required Variables
```bash
WIX_API_KEY=your_wix_api_key
WIX_SITE_ID=your_site_id
```

### Optional Variables
```bash
WIX_CACHE_DURATION=3600  # Cache duration in seconds
WIX_RATE_LIMIT=100       # API calls per minute
```

## Testing Strategy

### Unit Tests
- Wix API client functionality
- DJ data mapping and fallbacks
- Photo upload handling
- Error scenario handling

### Integration Tests
- End-to-end enhanced command workflow
- Wix API integration testing
- Photo upload testing
- Fallback mechanism testing

### Performance Tests
- Response time benchmarking
- Photo upload performance
- Caching effectiveness
- Rate limiting compliance 